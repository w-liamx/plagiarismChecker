const bcrypt = require("bcryptjs");
const db = require("../../models");
const { errorObject, issueJwt } = require("../../helpers/utils");
const Joi = require("joi");
const { Op } = require("sequelize");
require("dotenv").config();

const User = db.User;

const schema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "string.empty":
            err.message = "Password should not be empty!";
            break;
          case "string.pattern.base":
            err.message =
              "Password length must be between 3 to 30 characters long!";
            break;
        }
      });
      return errors;
    }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "string.empty":
            err.message = "Email should not be empty!";
            break;
          case "string.email":
            err.message = "Invalid Email";
            break;
          default:
            break;
        }
      });
      return errors;
    }),
});

const createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    try {
      await schema.validateAsync({
        email: email,
        password: password,
      });
      const user = await User.findOne({
        where: { [Op.or]: [{ email: email }] },
      });
      if (user !== null) {
        throw new Error(JSON.stringify(`User already exists`));
      }
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            console.log(err);
            next();
          }
          const pass = hash;
          User.create({
            email: email,
            password: pass,
          }).then((response) => {
            const { id, email } = response;
            const jwt = issueJwt(response);
            const newUser = {
              user: {
                _id: id,
                email: email,
              },
              token: jwt.token,
              expiresIn: jwt.expires,
            };
            return res.status(201).json({ status: "success", data: newUser });
          });
        });
      });
    } catch (err) {
      if (err) {
        console.log(err);
        next(err);
        if (err.isJoi) {
          return errorObject(res, 500, err.details[0]["message"]);
        }
        return errorObject(res, 500, JSON.parse(err.message));
      }
    }
  } catch (err) {
    if (err) {
      console.log(err);
      next(err);
      return errorObject(res, 500, err.message);
    }
  }
};

module.exports = {
  createUser,
};
