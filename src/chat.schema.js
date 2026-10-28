import { z } from "zod";

// POST /api/chat   { "message": "What are the four deadlock conditions?" }
export const chatSchema = z.object({
  message: z
    .string({ error: "message must be text" })
    .trim()
    .min(2, "message must be at least 2 characters")
    .max(500, "message must be at most 500 characters"),
});
