const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Survey = sequelize.define("Survey", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      allowAnonymous: true,
      requireLogin: false,
      multipleResponses: false,
      showResults: false,
    },
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Survey;

// models/Question.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Question = sequelize.define("Question", {
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
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      "text",
      "textarea",
      "radio",
      "checkbox",
      "select",
      "rating",
      "date"
    ),
    allowNull: false,
    defaultValue: "text",
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  validation: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
});

module.exports = Question;
