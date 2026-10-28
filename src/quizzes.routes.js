import { Router } from "express";
import { createQuiz, findQuizById, saveScore, findQuizHistory } from "./quizzes.model.js";
import { createQuizSchema, submitQuizSchema } from "./quizzes.schema.js";
import { findDocumentById } from "./documents.model.js";
import { validate, requireAuth } from "./middleware.js";
import { generateQuiz } from "./quiz.js";
import { sendAiError } from "./ai.js";

const router = Router();
router.use(requireAuth);

// GET /api/quizzes/history   (your past scores)
router.get("/history", (req, res) => {
  res.json(findQuizHistory(req.userId));
});

// POST /api/quizzes   { "documentId": 1, "count": 5 }
router.post("/", validate(createQuizSchema), async (req, res) => {
  const { documentId, count } = req.body;
  const document = findDocumentById(req.userId, documentId);
  if (!document) return res.status(404).json({ error: `Document with id ${documentId} not found` });
  try {
    const questions = await generateQuiz(document.text, count);
    const id = createQuiz(req.userId, document.id, questions);
    // Send questions and options only: the answers stay on the server
    const publicQuestions = questions.map(({ question, options }) => ({ question, options }));
    res.status(201).json({ id, filename: document.filename, questions: publicQuestions });
  } catch (error) {
    sendAiError(res, error);
  }
});

// POST /api/quizzes/:id/submit   { "answers": [2, 0, null, 1, 3] }
router.post("/:id/submit", validate(submitQuizSchema), (req, res) => {
  const quiz = findQuizById(req.userId, req.params.id);
  if (!quiz) return res.status(404).json({ error: `Quiz with id ${req.params.id} not found` });
  if (quiz.score !== null) return res.status(409).json({ error: "This quiz was already submitted" });
  const { answers } = req.body;
  if (answers.length !== quiz.total) {
    return res.status(400).json({ error: `Send exactly ${quiz.total} answers` });
  }
  const results = quiz.questions.map((question, i) => ({
    correct: answers[i] === question.answerIndex,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
  }));
  const score = results.filter((result) => result.correct).length;
  saveScore(req.userId, quiz.id, score);
  res.json({ score, total: quiz.total, results });
});

export default router;
