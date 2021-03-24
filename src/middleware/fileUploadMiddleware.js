const util = require("util");
const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../resources/documents`));
  },
  filename: (req, file, callback) => {
    const match = ["text/plain"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Please upload a text file (example.txt).`;
      return callback(message, null);
    }

    var filename = `${Date.now()}-comparison-${file.originalname}`;
    callback(null, filename);
  },
});

var upload = multer({ storage: storage }).fields([
  {
    name: "firstStudentAssignment",
    maxCount: 1,
  },
  {
    name: "secondStudentAssignment",
    maxCount: 1,
  },
]);
var uploadAssignmentsMiddleware = util.promisify(upload);
module.exports = uploadAssignmentsMiddleware;
