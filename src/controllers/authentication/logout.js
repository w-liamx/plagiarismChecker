const { errorObject } = require("../../helpers/utils");
const db = require("../../models");

const InvalidToken = db.InvalidTokens;

const logoutUser = async (req, res, next) => {
  //   get the token from header
  const token = req.headers.authorization;

  try {
    if (token) {
      await InvalidToken.create({
        token: token,
      });
      return res
        .status(200)
        .json({ status: "success", message: "successfully logged out" });
    } else {
      return res
        .status(400)
        .json({ status: "error", message: "You are not currently logged in" });
    }
  } catch (err) {
    console.log(err);
    next(err);
    return errorObject(res, 401, err.message);
  }
};

module.exports = {
  logoutUser,
};
