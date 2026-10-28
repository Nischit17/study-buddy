import { Router } from "express";
import { findAllNotes, findNoteById, createNote, updateNote, deleteNote } from "./notes.model.js";
import { noteSchema } from "./notes.schema.js";
import { validate } from "./middleware.js";

const router = Router();

const notFoundMessage = (id) => ({ error: `Note with id ${id} not found` });

// GET /api/notes   (optional: ?subject=OS  ?search=tcp)
router.get("/", (req, res) => {
  const { subject, search } = req.query;
  res.json(findAllNotes({ subject, search }));
});

// GET /api/notes/:id
router.get("/:id", (req, res) => {
  const note = findNoteById(req.params.id);
  if (!note) return res.status(404).json(notFoundMessage(req.params.id));
  res.json(note);
});

// POST /api/notes
router.post("/", validate(noteSchema), (req, res) => {
  const note = createNote(req.body);
  res.status(201).json(note);
});

// PUT /api/notes/:id
router.put("/:id", validate(noteSchema), (req, res) => {
  const note = updateNote(req.params.id, req.body);
  if (!note) return res.status(404).json(notFoundMessage(req.params.id));
  res.json(note);
});

// DELETE /api/notes/:id
router.delete("/:id", (req, res) => {
  const note = deleteNote(req.params.id);
  if (!note) return res.status(404).json(notFoundMessage(req.params.id));
  res.json({ message: "Note deleted", note });
});

export default router;
