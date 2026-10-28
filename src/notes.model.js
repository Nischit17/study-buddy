import db from "./db.js";

// Every query returns the same columns; created_at is renamed to createdAt for JSON
const SELECT_NOTES = "SELECT id, title, subject, content, created_at AS createdAt FROM notes";

// Every function now takes userId: a user can only see and change THEIR notes
export function findAllNotes(userId, { subject, search } = {}) {
  const conditions = ["user_id = ?"];
  const params = [userId];
  if (subject) {
    conditions.push("subject = ? COLLATE NOCASE");
    params.push(subject);
  }
  if (search) {
    conditions.push("title LIKE ?");
    params.push(`%${search}%`);
  }
  const where = ` WHERE ${conditions.join(" AND ")}`;
  return db.prepare(`${SELECT_NOTES}${where} ORDER BY id`).all(...params);
}

export function findNoteById(userId, id) {
  return db.prepare(`${SELECT_NOTES} WHERE id = ? AND user_id = ?`).get(id, userId);
}

export function createNote(userId, { title, subject, content }) {
  const result = db
    .prepare("INSERT INTO notes (user_id, title, subject, content) VALUES (?, ?, ?, ?)")
    .run(userId, title, subject, content);
  return findNoteById(userId, result.lastInsertRowid);
}

export function updateNote(userId, id, { title, subject, content }) {
  const result = db
    .prepare("UPDATE notes SET title = ?, subject = ?, content = ? WHERE id = ? AND user_id = ?")
    .run(title, subject, content, id, userId);
  return result.changes === 0 ? undefined : findNoteById(userId, id);
}

export function deleteNote(userId, id) {
  const note = findNoteById(userId, id);
  if (note) {
    db.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(id, userId);
  }
  return note;
}

export function findAllSubjects(userId) {
  const rows = db
    .prepare("SELECT DISTINCT subject FROM notes WHERE user_id = ? ORDER BY subject")
    .all(userId);
  return rows.map((row) => row.subject);
}
