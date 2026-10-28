import { Router } from "express";
import { validate, requireAuth } from "./middleware.js";
import { searchSchema } from "./search.schema.js";
import { searchNotes } from "./search.js";
import { sendAiError } from "./ai.js";

const router = Router();
router.use(requireAuth);

// POST /api/search   { "query": "processes waiting forever", "limit": 5 }
router.post("/", validate(searchSchema), async (req, res) => {
  const { query, limit } = req.body;
  try {
    const results = await searchNotes(req.userId, query, limit);
    res.json({
      query,
      results: results.map((result) => ({ ...result, score: Number(result.score.toFixed(3)) })),
    });
  } catch (error) {
    sendAiError(res, error);
  }
});

export default router;
