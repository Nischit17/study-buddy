import express from "express";

const app = express();
const PORT = 3000;

// ---------- Middleware ----------
// 1) Read JSON from the request body and put it in req.body
app.use(express.json());

// 2) Our own logger: prints every request that hits the server
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method}  ${req.url}`);
  next(); // pass the request to the next middleware / route
});

// ---------- "Database" (just an array in memory for today) ----------
let notes = [
  { id: 1, title: "What is an Operating System?", subject: "OS",
    content: "An OS manages hardware and software resources and provides services to programs.",
    createdAt: new Date().toISOString() },
  { id: 2, title: "Normalization", subject: "DBMS",
    content: "Normalization reduces data redundancy by splitting tables (1NF, 2NF, 3NF, BCNF).",
    createdAt: new Date().toISOString() },
];
let nextId = 3;

// Helper: check the data sent by the client
function validateNote(body) {
  if (!body) return "Send the note as JSON in the request body";
  if (typeof body.title !== "string" || body.title.trim() === "") return "title is required";
  if (typeof body.content !== "string" || body.content.trim() === "") return "content is required";
  return null; // null = no error
}

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.send("Welcome to Study Buddy API 📚");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptimeInSeconds: Math.round(process.uptime()) });
});

// READ all notes  (optional filter: /api/notes?subject=OS)
app.get("/api/notes", (req, res) => {
  const { subject } = req.query;
  if (subject) {
    const filtered = notes.filter(
      (note) => note.subject.toLowerCase() === subject.toLowerCase()
    );
    return res.json(filtered);
  }
  res.json(notes);
});

// READ one note by id
app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);
  if (!note) {
    return res.status(404).json({ error: `Note with id ${id} not found` });
  }
  res.json(note);
});

// CREATE a note
app.post("/api/notes", (req, res) => {
  const error = validateNote(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { title, subject, content } = req.body;
  const newNote = {
    id: nextId++,
    title,
    subject: subject || "General",
    content,
    createdAt: new Date().toISOString(),
  };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// UPDATE a note (replace its title, subject and content)
app.put("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);
  if (!note) {
    return res.status(404).json({ error: `Note with id ${id} not found` });
  }
  const error = validateNote(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  note.title = req.body.title;
  note.subject = req.body.subject || "General";
  note.content = req.body.content;
  res.json(note);
});

// DELETE a note
app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);
  if (!note) {
    return res.status(404).json({ error: `Note with id ${id} not found` });
  }
  notes = notes.filter((n) => n.id !== id);
  res.json({ message: "Note deleted", note });
});

// ---------- Fallbacks (always at the END) ----------
// Any route not matched above
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Any error thrown above (for example: invalid JSON in the body)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

app.listen(PORT, (error) => {
  if (error) {
    console.error(`❌ Could not start server: ${error.message}`);
    return;
  }
  console.log(`✅ Study Buddy API running at http://localhost:${PORT}`);
});
