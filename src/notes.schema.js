import { z } from "zod";

// The shape a note must have when a client sends it to us
export const noteSchema = z.object({
  title: z
    .string({ error: "title is required" })
    .trim()
    .min(1, "title is required")
    .max(200, "title must be 200 characters or less"),
  subject: z
    .string()
    .trim()
    .max(50, "subject must be 50 characters or less")
    .optional()
    .transform((subject) => subject || "General"),
  content: z
    .string({ error: "content is required" })
    .trim()
    .min(1, "content is required"),
});
