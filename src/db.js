import Database from "better-sqlite3";

// Open the database file named in .env (it is created if it does not exist)
const db = new Database(process.env.DB_FILE || "study-buddy.db");

// Make SQLite enforce the link between notes and users
db.pragma("foreign_keys = ON");

// Users: one row per registered account
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Notes: every note now belongs to one user (user_id)
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    subject    TEXT NOT NULL DEFAULT 'General',
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Documents: uploaded PDFs (we keep the extracted text, not the file itself)
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename   TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    pages      INTEGER NOT NULL,
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Quizzes: AI-written questions (with answers) and the score once submitted
db.exec(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id  INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    questions    TEXT NOT NULL,
    total        INTEGER NOT NULL,
    score        INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    submitted_at TEXT
  )
`);

// Chunks: small pieces of each PDF with their embedding (meaning as numbers)
db.exec(`
  CREATE TABLE IF NOT EXISTS chunks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL,
    text        TEXT NOT NULL,
    embedding   TEXT NOT NULL
  )
`);

export default db;
