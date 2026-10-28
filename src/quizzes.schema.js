import { z } from "zod";

// POST /api/quizzes   { "documentId": 1, "count": 5 }
export const createQuizSchema = z.object({
  documentId: z.number({ error: "documentId must be a number" }).int().positive(),
  count: z
    .number({ error: "count must be a number" })
    .int()
    .min(3, "count must be between 3 and 10")
    .max(10, "count must be between 3 and 10")
    .default(5),
});

// POST /api/quizzes/:id/submit   { "answers": [2, 0, null, 1, 3] }   (null = skipped)
export const submitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3).nullable(), {
    error: "answers must be an array of option numbers",
  }),
});
