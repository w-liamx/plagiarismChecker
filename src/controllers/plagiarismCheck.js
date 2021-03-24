const fs = require("fs");
const path = require("path");
const { textCosineSimilarity, percentageCheat } = require("../helpers/utils");
const uploadAssignments = require("../middleware/fileUploadMiddleware");
const db = require("../models");

const PlagCheckHistory = db.PlagCheckHistory;
const Student = db.Student;
const User = db.User;

const compareFiles = async (req, res, next) => {
  try {
    await uploadAssignments(req, res);
    const { firstStudentName, secondStudentName, comparisonType } = req.body;

    if (
      !req.files.firstStudentAssignment ||
      !req.files.secondStudentAssignment
    ) {
      return res.status(400).send({
        status: "error",
        message: "Please upload the assignments you want to compare!",
      });
    }

    if (!firstStudentName || !secondStudentName) {
      return res.status(400).send({
        status: "error",
        message:
          "Please provide the names of the students you want to compare their assignments!",
      });
    }

    // create a record for this request
    const studA = await Student.create({
      name: firstStudentName,
      assignment: req.files.firstStudentAssignment[0].filename,
    });
    const studB = await Student.create({
      name: secondStudentName,
      assignment: req.files.secondStudentAssignment[0].filename,
    });

    const history = await PlagCheckHistory.create({
      firstStudent: studA.id,
      secondStudent: studB.id,
    });

    // Carry out the plagiarism check and return an interpretation
    const pathToFirstStudentAssignment =
      req.files.firstStudentAssignment[0].path;

    const pathToSecondStudentAssignment =
      req.files.secondStudentAssignment[0].path;

    let studentOne;
    let studentTwo;
    fs.readFile(pathToFirstStudentAssignment, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: "error", message: err.message });
      }
      studentOne = data.toString();

      fs.readFile(pathToSecondStudentAssignment, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ status: "error", message: err.message });
        }
        studentTwo = data.toString();

        const plagiarismTestScore = textCosineSimilarity(
          studentOne,
          studentTwo,
          comparisonType
        );

        history.score = plagiarismTestScore;
        history.save();

        const studentA = percentageCheat(
          studentTwo,
          studentOne,
          comparisonType
        );
        const studentB = percentageCheat(
          studentOne,
          studentTwo,
          comparisonType
        );

        let interpretation = `${firstStudentName}'s assignment is ${plagiarismTestScore}% similar to ${secondStudentName}'s assignment. This is reasonably low, therefore, both students' efforts can be considered authentic.`;
        if (plagiarismTestScore > 30 < 49) {
          interpretation = `${firstStudentName}'s assignment is ${plagiarismTestScore}% similar to ${secondStudentName}'s assignment. There may have been a mild plagiarism going on, but it can be forgiven.`;
        }
        if (plagiarismTestScore >= 50) {
          interpretation = `${firstStudentName}'s assignment is ${plagiarismTestScore}% similar to ${secondStudentName}'s assignment. This is too much for a coincidence. Either ${firstStudentName} copied ${studentA}% of his work from ${secondStudentName} or ${secondStudentName} copied ${studentB}% of his work from ${firstStudentName}.`;
        }

        return res.status(200).json({
          status: "success",
          message: "Comparison done!",
          interpretation: interpretation,
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: `Could not upload the assignments: ${err}`,
    });
  }
};

const getComparisonHistory = async (req, res, next) => {
  try {
    const history = await PlagCheckHistory.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "email"],
        },
        {
          model: Student,
          as: "studentOne",
          attributes: ["id", "name"],
        },
        {
          model: Student,
          as: "studentTwo",
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "score"],
    });
    if (history.length < 1) {
      return res.status(200).json({
        status: "success",
        message: "You have not made any comparisons yet.",
      });
    }
    return res.status(200).json({
      status: "success",
      data: history,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const repeatComparison = async (req, res, next) => {
  const recordId = req.params.recordId;
  const { comparisonType } = req.body;
  try {
    const record = await PlagCheckHistory.findOne({
      where: { id: recordId },
      include: [
        {
          model: User,
          as: "teacher",
        },
        {
          model: Student,
          as: "studentOne",
        },
        {
          model: Student,
          as: "studentTwo",
        },
      ],
    });
    if (record) {
      // Carry out the plagiarism check and return an interpretation
      const studentOneRecord = record.studentOne;
      const studentTwoRecord = record.studentTwo;

      const basePath = path.join(`${__dirname}/../resources/documents/`);

      const firstStudentName = studentOneRecord.name;
      const secondStudentName = studentTwoRecord.name;
      const pathToFirstStudentAssignment =
        basePath + studentOneRecord.assignment;

      const pathToSecondStudentAssignment =
        basePath + studentTwoRecord.assignment;

      let studentOne;
      let studentTwo;
      fs.readFile(pathToFirstStudentAssignment, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ status: "error", message: err.message });
        }
        studentOne = data.toString();

        fs.readFile(pathToSecondStudentAssignment, "utf8", (err, data) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ status: "error", message: err.message });
          }
          studentTwo = data.toString();

          const plagiarismTestScore = textCosineSimilarity(
            studentOne,
            studentTwo,
            comparisonType
          );
          const studentA = percentageCheat(
            studentTwo,
            studentOne,
            comparisonType
          );
          const studentB = percentageCheat(
            studentOne,
            studentTwo,
            comparisonType
          );

          let interpretation = `${firstStudentName}'s assignment is ${plagiarismTestScore}% similar to ${secondStudentName}'s assignment. This is reasonably low, therefore, both students' efforts can be considered authentic.`;
          if (plagiarismTestScore > 30 < 49) {
            interpretation = `${firstStudentName}'s assignment is ${plagiarismTestScore}% similar to ${secondStudentName}'s assignment. There may have been a mild plagiarism going on, but it can be forgiven.`;
          }
          if (plagiarismTestScore >= 50) {
            interpretation = `${firstStudentName}'s assignment is ${plagiarismTestScore}% similar to ${secondStudentName}'s assignment. This is too much for a coincidence. Either ${firstStudentName} copied ${studentA}% of his work from ${secondStudentName} or ${secondStudentName} copied ${studentB}% of his work from ${firstStudentName}.`;
          }

          return res.status(200).json({
            status: "success",
            message: "Comparison done!",
            interpretation: interpretation,
          });
        });
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "No records found",
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  compareFiles,
  getComparisonHistory,
  repeatComparison,
};
