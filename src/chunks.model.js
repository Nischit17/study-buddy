import db from "./db.js";

// The user's PDFs that have no chunks yet (uploaded before today, or indexing failed)
export function findUnindexedDocuments(userId) {
  return db
    .prepare(
      `SELECT id, filename, text FROM documents
       WHERE user_id = ? AND id NOT IN (SELECT document_id FROM chunks)`
    )
    .all(userId);
}

// Save all chunks of one PDF together: all of them or none (a transaction)
export const saveChunks = db.transaction((documentId, texts, vectors) => {
  db.prepare("DELETE FROM chunks WHERE document_id = ?").run(documentId); // never twice
  const insert = db.prepare(
    "INSERT INTO chunks (document_id, position, text, embedding) VALUES (?, ?, ?, ?)"
  );
  texts.forEach((text, i) => insert.run(documentId, i, text, JSON.stringify(vectors[i])));
});

// Every chunk of the user's PDFs, with the PDF's name and the vector as numbers again
export function findUserChunks(userId) {
  return db
    .prepare(
      `SELECT chunks.id, chunks.text, chunks.embedding, documents.id AS documentId, documents.filename
       FROM chunks JOIN documents ON documents.id = chunks.document_id
       WHERE documents.user_id = ?`
    )
    .all(userId)
    .map((chunk) => ({ ...chunk, embedding: JSON.parse(chunk.embedding) }));
}
