import Database from "better-sqlite3";

const db = new Database(":memory:");
db.exec("CREATE TABLE students (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, branch TEXT NOT NULL, cgpa REAL)");
const insert = db.prepare("INSERT INTO students (name, branch, cgpa) VALUES (?, ?, ?)");
insert.run("Asha", "CSE", 9.1);
insert.run("Ravi", "ECE", 7.4);
insert.run("Meera", "CSE", 8.6);
insert.run("John", "ME", 6.9);

// 5) UPDATE: change existing rows (ALWAYS use WHERE, or every row changes!)
const updated = db.prepare("UPDATE students SET cgpa = ? WHERE name = ?").run(7.9, "Ravi");
console.log("Rows updated:", updated.changes);

// 6) DELETE: remove rows (again, ALWAYS use WHERE)
const deleted = db.prepare("DELETE FROM students WHERE name = ?").run("John");
console.log("Rows deleted:", deleted.changes);

// 7) .get() returns ONE row, .all() returns an ARRAY of rows
console.log(db.prepare("SELECT * FROM students WHERE id = ?").get(2));

// 8) Aggregate functions: COUNT, AVG
console.log(db.prepare("SELECT COUNT(*) AS total, ROUND(AVG(cgpa), 2) AS avgCgpa FROM students").get());
