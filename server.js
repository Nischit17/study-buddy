import express from "express";
import notesRouter from "./src/notes.routes.js";
import authRouter from "./src/auth.routes.js";
import documentsRouter from "./src/documents.routes.js";
import quizzesRouter from "./src/quizzes.routes.js";
import searchRouter from "./src/search.routes.js";
import { findAllSubjects } from "./src/notes.model.js";
import { logger, requireAuth, notFound, errorHandler } from "./src/middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(express.json());
app.use(logger);
app.use(express.static("public")); // the website: public/index.html is served at "/"

// ---------- Routes ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptimeInSeconds: Math.round(process.uptime()) });
});

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/search", searchRouter);

app.get("/api/subjects", requireAuth, (req, res) => {
  res.json(findAllSubjects(req.userId));
});

// ---------- Fallbacks (always at the END) ----------
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, (error) => {
  if (error) {
    console.error(`❌ Could not start server: ${error.message}`);
    return;
  }
  console.log(`✅ Study Buddy API running at http://localhost:${PORT}`);
});
