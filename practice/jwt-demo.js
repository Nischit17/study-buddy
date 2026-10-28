import jwt from "jsonwebtoken";

const SECRET = "practice-secret";

// 1) sign: the server creates a token after a successful login
const token = jwt.sign({ userId: 7 }, SECRET, { expiresIn: "1h" });
console.log("Token:", token);

// 2) verify: on every request the server checks the token is genuine
const payload = jwt.verify(token, SECRET);
console.log("Verified payload:", payload);

// 3) A token changed by someone else is rejected
const tampered = token.slice(0, -2) + (token.endsWith("A") ? "BB" : "AA");
try {
  jwt.verify(tampered, SECRET);
} catch (error) {
  console.log("Tampered token:", error.message);
}
