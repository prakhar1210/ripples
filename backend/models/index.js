const sequelize = require("../config/database");
const User = require("./User");
const Survey = require("./Survey");
const Question = require("./Question");
const Response = require("./response");
const Respondent = require("./respondent");

// Define associations
User.hasMany(Survey, { foreignKey: "creatorId", as: "surveys" });
Survey.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

Survey.hasMany(Question, { foreignKey: "surveyId", as: "questions" });
Question.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

Survey.hasMany(Response, { foreignKey: "surveyId", as: "responses" });
Response.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

Respondent.hasMany(Response, { foreignKey: "respondentId", as: "responses" });
Response.belongsTo(Respondent, {
  foreignKey: "respondentId",
  as: "respondent",
});

module.exports = {
  sequelize,
  User,
  Survey,
  Question,
  Response,
  Respondent,
};

// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
