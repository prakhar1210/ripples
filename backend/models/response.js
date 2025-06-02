const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Response = sequelize.define("Response", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  surveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Surveys",
      key: "id",
    },
  },
  respondentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "Respondents",
      key: "id",
    },
  },
  answers: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  isComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Response;
