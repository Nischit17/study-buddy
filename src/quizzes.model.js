import db from "./db.js";

// The questions (with answers) are saved as JSON text and never leave the server early
export function createQuiz(userId, documentId, questions) {
  const result = db
    .prepare("INSERT INTO quizzes (user_id, document_id, questions, total) VALUES (?, ?, ?, ?)")
    .run(userId, documentId, JSON.stringify(questions), questions.length);
  return result.lastInsertRowid;
}

export function findQuizById(userId, id) {
  const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ? AND user_id = ?").get(id, userId);
  if (!quiz) return undefined;
  return { ...quiz, questions: JSON.parse(quiz.questions) };
}

export function saveScore(userId, id, score) {
  db.prepare("UPDATE quizzes SET score = ?, submitted_at = datetime('now') WHERE id = ? AND user_id = ?")
    .run(score, id, userId);
}

// Submitted quizzes with the PDF's name, newest first (JOIN = combine two tables)
export function findQuizHistory(userId) {
  return db
    .prepare(
      `SELECT quizzes.id, documents.filename, quizzes.score, quizzes.total,
         quizzes.submitted_at AS submittedAt
       FROM quizzes JOIN documents ON documents.id = quizzes.document_id
       WHERE quizzes.user_id = ? AND quizzes.score IS NOT NULL
       ORDER BY quizzes.id DESC`
    )
    .all(userId);
}
