import { Router } from "express";
import { findAllDocuments, findDocumentById, createDocument, deleteDocument } from "./documents.model.js";
import { requireAuth } from "./middleware.js";
import { uploadPdf } from "./upload.js";
import { extractPdfText } from "./pdf.js";
import { summariseNotes } from "./summary.js";
import { sendAiError } from "./ai.js";

const router = Router();

// Every documents route needs a logged-in user (checked BEFORE any upload is read)
router.use(requireAuth);

const notFoundMessage = (id) => ({ error: `Document with id ${id} not found` });

// POST /api/documents   (form-data, field "file" = the PDF)
router.post("/", uploadPdf, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Attach a PDF in the form field named file" });
  }
  let extracted;
  try {
    extracted = await extractPdfText(req.file.buffer);
  } catch {
    return res.status(400).json({ error: "Could not read this PDF. Is the file damaged?" });
  }
  if (!extracted.text) {
    return res.status(422).json({ error: "No text found in this PDF. Scanned images are not supported." });
  }
  const document = createDocument(req.userId, {
    filename: req.file.originalname,
    sizeBytes: req.file.size,
    pages: extracted.pages,
    text: extracted.text,
  });
  res.status(201).json(document);
});

// GET /api/documents   (list, without the full text)
router.get("/", (req, res) => {
  res.json(findAllDocuments(req.userId));
});

// GET /api/documents/:id   (one document WITH its text)
router.get("/:id", (req, res) => {
  const document = findDocumentById(req.userId, req.params.id);
  if (!document) return res.status(404).json(notFoundMessage(req.params.id));
  res.json(document);
});

// POST /api/documents/:id/summary   (Gemini summarises the PDF's text)
router.post("/:id/summary", async (req, res) => {
  const document = findDocumentById(req.userId, req.params.id);
  if (!document) return res.status(404).json(notFoundMessage(req.params.id));
  try {
    const summary = await summariseNotes(document.text);
    res.json({ id: document.id, filename: document.filename, summary });
  } catch (error) {
    sendAiError(res, error);
  }
});

// DELETE /api/documents/:id
router.delete("/:id", (req, res) => {
  const document = deleteDocument(req.userId, req.params.id);
  if (!document) return res.status(404).json(notFoundMessage(req.params.id));
  res.json({ message: "Document deleted", document });
});

export default router;
