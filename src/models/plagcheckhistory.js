"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PlagCheckHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PlagCheckHistory.belongsTo(models.User, {
        as: "teacher",
        onDelete: "CASCADE",
        hooks: true,
        foreignKey: {
          name: "userId",
          allowNull: false,
        },
      });

      PlagCheckHistory.belongsTo(models.Student, {
        as: "studentOne",
        onDelete: "CASCADE",
        hooks: true,
        foreignKey: {
          name: "firstStudent",
          allowNull: false,
        },
      });

      PlagCheckHistory.belongsTo(models.Student, {
        as: "studentTwo",
        onDelete: "CASCADE",
        hooks: true,
        foreignKey: {
          name: "secondStudent",
          allowNull: false,
        },
      });
    }
  }
  PlagCheckHistory.init(
    {
      firstStudent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      secondStudent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PlagCheckHistory",
    }
  );
  return PlagCheckHistory;
};
