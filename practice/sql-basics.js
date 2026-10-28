import Database from "better-sqlite3";

// ":memory:" = a temporary database that lives only in RAM (perfect for practice)
const db = new Database(":memory:");

// 1) CREATE TABLE: define the columns and their types
db.exec(`
  CREATE TABLE students (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT NOT NULL,
    branch TEXT NOT NULL,
    cgpa   REAL
  )
`);

// 2) INSERT: add rows (the ? marks are filled in by .run)
const insert = db.prepare("INSERT INTO students (name, branch, cgpa) VALUES (?, ?, ?)");
insert.run("Asha", "CSE", 9.1);
insert.run("Ravi", "ECE", 7.4);
insert.run("Meera", "CSE", 8.6);
insert.run("John", "ME", 6.9);

// 3) SELECT: read rows
console.table(db.prepare("SELECT * FROM students").all());

// 4) WHERE + ORDER BY: filter and sort
const cse = db.prepare("SELECT name, cgpa FROM students WHERE branch = ? ORDER BY cgpa DESC").all("CSE");
console.table(cse);
