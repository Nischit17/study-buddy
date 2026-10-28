import { Router } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserById, findUserWithPasswordByEmail } from "./users.model.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { validate, requireAuth } from "./middleware.js";
import { createToken } from "./token.js";

const router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  if (findUserWithPasswordByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ name, email, passwordHash });
  res.status(201).json({ user, token: createToken(user.id) });
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const found = findUserWithPasswordByEmail(email);
  const passwordOk = found && (await bcrypt.compare(password, found.password_hash));
  if (!passwordOk) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ user: findUserById(found.id), token: createToken(found.id) });
});

// GET /api/auth/me   (who am I?)
router.get("/me", requireAuth, (req, res) => {
  res.json(findUserById(req.userId));
});

export default router;
