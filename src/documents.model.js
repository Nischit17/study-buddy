import db from "./db.js";

// Summary = everything except the (possibly very long) text
const SELECT_SUMMARY = `SELECT id, filename, size_bytes AS sizeBytes, pages,
  length(text) AS characters, created_at AS createdAt FROM documents`;

export function findAllDocuments(userId) {
  return db.prepare(`${SELECT_SUMMARY} WHERE user_id = ? ORDER BY id`).all(userId);
}

function findDocumentSummary(userId, id) {
  return db.prepare(`${SELECT_SUMMARY} WHERE id = ? AND user_id = ?`).get(id, userId);
}

// One document WITH its full text
export function findDocumentById(userId, id) {
  return db
    .prepare(`SELECT id, filename, pages, text, created_at AS createdAt
      FROM documents WHERE id = ? AND user_id = ?`)
    .get(id, userId);
}

export function createDocument(userId, { filename, sizeBytes, pages, text }) {
  const result = db
    .prepare("INSERT INTO documents (user_id, filename, size_bytes, pages, text) VALUES (?, ?, ?, ?, ?)")
    .run(userId, filename, sizeBytes, pages, text);
  return findDocumentSummary(userId, result.lastInsertRowid);
}

export function deleteDocument(userId, id) {
  const document = findDocumentSummary(userId, id);
  if (document) {
    db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run(id, userId);
  }
  return document;
}
