import db from "./db.js";

// role is "user" (the student) or "assistant" (Study Buddy); sources are saved as JSON text
export function saveMessage(userId, role, content, sources = []) {
  db.prepare("INSERT INTO messages (user_id, role, content, sources) VALUES (?, ?, ?, ?)")
    .run(userId, role, content, JSON.stringify(sources));
}

// The newest messages, returned oldest first (the order of a chat)
export function findRecentMessages(userId, limit) {
  return db
    .prepare(
      `SELECT id, role, content, sources, created_at AS createdAt FROM messages
       WHERE user_id = ? ORDER BY id DESC LIMIT ?`
    )
    .all(userId, limit)
    .reverse()
    .map((message) => ({ ...message, sources: JSON.parse(message.sources) }));
}

export function deleteMessages(userId) {
  return db.prepare("DELETE FROM messages WHERE user_id = ?").run(userId).changes;
}
