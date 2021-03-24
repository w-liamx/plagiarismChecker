const express = require("express");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");

const appRouter = require("./routes/routes");

global.__basedir = __dirname;

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());

app.use("/api", appRouter);

module.exports = app;
