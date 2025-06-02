const express = require("express");
const Joi = require("joi");
const { Survey, Question, Response, Respondent, User } = require("../models");
const { authenticate, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Validation schemas
const surveySchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow(""),
  questions: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      type: Joi.string()
        .valid(
          "text",
          "textarea",
          "radio",
          "checkbox",
          "select",
          "rating",
          "date"
        )
        .required(),
      options: Joi.array().items(Joi.string()),
      required: Joi.boolean().default(false),
      validation: Joi.object().default({}),
    })
  ),
  settings: Joi.object({
    allowAnonymous: Joi.boolean().default(true),
    requireLogin: Joi.boolean().default(false),
    multipleResponses: Joi.boolean().default(false),
    showResults: Joi.boolean().default(false),
  }),
});

// Get all surveys for authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      where: { creatorId: req.user.id },
      include: [
        {
          model: Question,
          as: "questions",
          order: [["order", "ASC"]],
        },
        {
          model: Response,
          as: "responses",
          attributes: ["id", "isComplete", "submittedAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Add response count to each survey
    const surveysWithCounts = surveys.map((survey) => ({
      ...survey.toJSON(),
      responseCount: survey.responses.filter((r) => r.isComplete).length,
      totalResponses: survey.responses.length,
    }));

    res.json({ surveys: surveysWithCounts });
  } catch (error) {
    console.error("Get surveys error:", error);
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// Get single survey (public or private)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
          order: [["order", "ASC"]],
        },
        {
          model: User,
          as: "creator",
          attributes: ["name"],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Check permissions
    if (
      !survey.isPublished &&
      (!req.user || req.user.id !== survey.creatorId)
    ) {
      return res.status(403).json({ error: "Survey not accessible" });
    }

    res.json({ survey });
  } catch (error) {
    console.error("Get survey error:", error);
    res.status(500).json({ error: "Failed to fetch survey" });
  }
});

// Create new survey
router.post("/", authenticate, async (req, res) => {
  try {
    const { error } = surveySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, description, questions = [], settings } = req.body;

    // Create survey
    const survey = await Survey.create({
      title,
      description,
      creatorId: req.user.id,
      settings,
    });

    // Create questions
    if (questions.length > 0) {
      const questionsWithSurveyId = questions.map((q, index) => ({
        ...q,
        surveyId: survey.id,
        order: index,
      }));

      await Question.bulkCreate(questionsWithSurveyId);
    }

    // Fetch complete survey with questions
    const completeSurvey = await Survey.findByPk(survey.id, {
      include: [
        {
          model: Question,
          as: "questions",
          order: [["order", "ASC"]],
        },
      ],
    });

    res.status(201).json({
      message: "Survey created successfully",
      survey: completeSurvey,
    });
  } catch (error) {
    console.error("Create survey error:", error);
    res.status(500).json({ error: "Failed to create survey" });
  }
});

// Update survey
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = surveySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    if (survey.creatorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this survey" });
    }

    const { title, description, questions = [], settings } = req.body;

    // Update survey
    await survey.update({ title, description, settings });

    // Delete existing questions and create new ones
    await Question.destroy({ where: { surveyId: id } });

    if (questions.length > 0) {
      const questionsWithSurveyId = questions.map((q, index) => ({
        ...q,
        surveyId: id,
        order: index,
      }));

      await Question.bulkCreate(questionsWithSurveyId);
    }

    // Fetch updated survey
    const updatedSurvey = await Survey.findByPk(id, {
      include: [
        {
          model: Question,
          as: "questions",
          order: [["order", "ASC"]],
        },
      ],
    });

    res.json({
      message: "Survey updated successfully",
      survey: updatedSurvey,
    });
  } catch (error) {
    console.error("Update survey error:", error);
    res.status(500).json({ error: "Failed to update survey" });
  }
});

// Publish/unpublish survey
router.patch("/:id/publish", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    if (survey.creatorId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await survey.update({
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    res.json({
      message: `Survey ${
        isPublished ? "published" : "unpublished"
      } successfully`,
      survey,
    });
  } catch (error) {
    console.error("Publish survey error:", error);
    res.status(500).json({ error: "Failed to update survey status" });
  }
});

// Delete survey
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    if (survey.creatorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this survey" });
    }

    // Delete associated data
    await Question.destroy({ where: { surveyId: id } });
    await Response.destroy({ where: { surveyId: id } });
    await survey.destroy();

    res.json({ message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Delete survey error:", error);
    res.status(500).json({ error: "Failed to delete survey" });
  }
});

module.exports = router;
