require("dotenv").config();
module.exports = {
  development: {
    username: process.env.dbUsername || "",
    password: process.env.dbPassword || "",
    database: process.env.dbName || "",
    host: process.env.dbHost || "",
    dialect: process.env.dialect || "",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    database: process.env.DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
  },
};
