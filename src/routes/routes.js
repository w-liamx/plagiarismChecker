const express = require("express");
const passport = require("passport");
const { loginUser } = require("../controllers/authentication/login");
const { logoutUser } = require("../controllers/authentication/logout");
const { createUser } = require("../controllers/authentication/registration");
const {
  compareFiles,
  getComparisonHistory,
  repeatComparison,
} = require("../controllers/plagiarismCheck");
const isUserLoggedOut = require("../middleware/checkAuthState");
require("../config/passport")(passport);

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logoutUser
);
router.post(
  "/compare-assignments",
  isUserLoggedOut,
  passport.authenticate("jwt", { session: false }),
  compareFiles
);
router.get(
  "/get-comparisons",
  isUserLoggedOut,
  passport.authenticate("jwt", { session: false }),
  getComparisonHistory
);
router.post(
  "/repeat-comparison/:recordId",
  isUserLoggedOut,
  passport.authenticate("jwt", { session: false }),
  repeatComparison
);

module.exports = router;
