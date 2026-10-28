import db from "./db.js";

// Every query returns the same columns; created_at is renamed to createdAt for JSON
const SELECT_NOTES = "SELECT id, title, subject, content, created_at AS createdAt FROM notes";

export function findAllNotes({ subject, search } = {}) {
  const conditions = [];
  const params = [];
  if (subject) {
    conditions.push("subject = ? COLLATE NOCASE");
    params.push(subject);
  }
  if (search) {
    conditions.push("title LIKE ?");
    params.push(`%${search}%`);
  }
  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
  return db.prepare(`${SELECT_NOTES}${where} ORDER BY id`).all(...params);
}

export function findNoteById(id) {
  return db.prepare(`${SELECT_NOTES} WHERE id = ?`).get(id);
}

export function createNote({ title, subject, content }) {
  const result = db
    .prepare("INSERT INTO notes (title, subject, content) VALUES (?, ?, ?)")
    .run(title, subject, content);
  return findNoteById(result.lastInsertRowid);
}

export function updateNote(id, { title, subject, content }) {
  const result = db
    .prepare("UPDATE notes SET title = ?, subject = ?, content = ? WHERE id = ?")
    .run(title, subject, content, id);
  return result.changes === 0 ? undefined : findNoteById(id);
}

export function deleteNote(id) {
  const note = findNoteById(id);
  if (note) {
    db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  }
  return note;
}

export function findAllSubjects() {
  const rows = db.prepare("SELECT DISTINCT subject FROM notes ORDER BY subject").all();
  return rows.map((row) => row.subject);
}
