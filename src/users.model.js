import db from "./db.js";

// Never select password_hash here: this is what we send back to clients
const SELECT_USERS = "SELECT id, name, email, created_at AS createdAt FROM users";

export function findUserById(id) {
  return db.prepare(`${SELECT_USERS} WHERE id = ?`).get(id);
}

// Used only for login: includes password_hash so we can check the password
export function findUserWithPasswordByEmail(email) {
  return db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email);
}

export function createUser({ name, email, passwordHash }) {
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name, email, passwordHash);
  return findUserById(result.lastInsertRowid);
}
