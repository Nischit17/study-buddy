import express from "express";
import notesRouter from "./src/notes.routes.js";
import { findAllSubjects } from "./src/notes.model.js";
import { logger, notFound, errorHandler } from "./src/middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(express.json());
app.use(logger);

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.send("Welcome to Study Buddy API 📚");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptimeInSeconds: Math.round(process.uptime()) });
});

app.use("/api/notes", notesRouter);

app.get("/api/subjects", (req, res) => {
  res.json(findAllSubjects());
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
