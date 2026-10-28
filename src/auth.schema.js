import { z } from "zod";

const email = z
  .string({ error: "email is required" })
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const registerSchema = z.object({
  name: z
    .string({ error: "name is required" })
    .trim()
    .min(2, "name must be at least 2 characters")
    .max(60, "name must be 60 characters or less"),
  email,
  password: z
    .string({ error: "password is required" })
    .min(8, "password must be at least 8 characters")
    .max(72, "password must be 72 characters or less"),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: "password is required" }).min(1, "password is required"),
});
