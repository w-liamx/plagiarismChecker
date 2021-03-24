const bcrypt = require("bcryptjs");
const { errorObject, issueJwt } = require("../../helpers/utils");
const db = require("../../models");

const User = db.User;

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });
    if (user === null) {
      throw new Error("Incorrect Email or Password");
    }
    bcrypt.compare(password, user.password, (err, response) => {
      if (err) {
        console.log(err);
        next(err);
      }
      if (!response) {
        throw new Error("Incorrect Email or Password");
      } else {
        const { id, email } = user;
        const jwt = issueJwt(user);
        const newUser = {
          user: {
            _id: id,
            email: email,
          },
          token: jwt.token,
          expiresIn: jwt.expires,
        };
        return res.status(200).json({ status: "success", data: newUser });
      }
    });
  } catch (err) {
    console.log(err);
    next(err);
    return errorObject(res, 401, err.message);
  }
};

module.exports = {
  loginUser,
};
