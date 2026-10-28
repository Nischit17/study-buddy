import Database from "better-sqlite3";

// Open the database file named in .env (it is created if it does not exist)
const db = new Database(process.env.DB_FILE || "study-buddy.db");

// Create the notes table the first time the app runs
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    subject    TEXT NOT NULL DEFAULT 'General',
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Add two sample notes, but only when the table is empty
const { count } = db.prepare("SELECT COUNT(*) AS count FROM notes").get();
if (count === 0) {
  const insert = db.prepare("INSERT INTO notes (title, subject, content) VALUES (?, ?, ?)");
  insert.run("What is an Operating System?", "OS",
    "An OS manages hardware and software resources and provides services to programs.");
  insert.run("Normalization", "DBMS",
    "Normalization reduces data redundancy by splitting tables (1NF, 2NF, 3NF, BCNF).");
}

export default db;
