import { z } from "zod";

// POST /api/search   { "query": "processes waiting forever", "limit": 5 }
export const searchSchema = z.object({
  query: z
    .string({ error: "query must be text" })
    .trim()
    .min(3, "query must be at least 3 characters")
    .max(200, "query must be at most 200 characters"),
  limit: z
    .number({ error: "limit must be a number" })
    .int()
    .min(1, "limit must be between 1 and 10")
    .max(10, "limit must be between 1 and 10")
    .default(5),
});
