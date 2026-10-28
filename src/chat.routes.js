import { Router } from "express";
import { validate, requireAuth } from "./middleware.js";
import { chatSchema } from "./chat.schema.js";
import { answerQuestion } from "./chat.js";
import { saveMessage, findRecentMessages, deleteMessages } from "./messages.model.js";
import { sendAiError } from "./ai.js";

// How many earlier messages Gemini sees (3 questions + 3 answers)
const HISTORY_SIZE = 6;

const router = Router();
router.use(requireAuth);

// GET /api/chat   (the chat so far, oldest first)
router.get("/", (req, res) => {
  res.json(findRecentMessages(req.userId, 50));
});

// POST /api/chat   { "message": "..." }
router.post("/", validate(chatSchema), async (req, res) => {
  const { message } = req.body;
  try {
    const history = findRecentMessages(req.userId, HISTORY_SIZE);
    const { answer, sources } = await answerQuestion(req.userId, message, history);
    saveMessage(req.userId, "user", message);
    saveMessage(req.userId, "assistant", answer, sources);
    res.status(201).json({ answer, sources });
  } catch (error) {
    sendAiError(res, error);
  }
});

// DELETE /api/chat   (start a fresh chat)
router.delete("/", (req, res) => {
  res.json({ deleted: deleteMessages(req.userId) });
});

export default router;
