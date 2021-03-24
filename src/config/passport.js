const fileSystem = require("fs");
const path = require("path");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db = require("../models");
const pathToKey = path.join(__dirname, "/cryptography/", "id_rsa_pub.pem");
const PUB_KEY = fileSystem.readFileSync(pathToKey, "utf8");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

const User = db.User;

const strategy = new JwtStrategy(options, async (payload, done) => {
  try {
    const user = await User.findOne({ where: { id: payload.sub } });
    if (user) {
      return done(null, payload);
    }
    return done(Error("Kindly login to access this resource"), false);
  } catch (err) {
    console.log(err);
  }
});

module.exports = (passport) => {
  passport.use(strategy);
};
