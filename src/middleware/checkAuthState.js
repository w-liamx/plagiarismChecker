const db = require("../models");

const InvalidToken = db.InvalidTokens;

const isUserLoggedOut = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    if (token) {
      const user = await InvalidToken.findOne({ where: { token: token } });
      if (user) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "Kindly Login to continue",
        });
      } else {
      }
    }
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = isUserLoggedOut;
