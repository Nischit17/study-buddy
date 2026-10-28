import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Stop the server at startup if the secret is missing, instead of failing later
if (!SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to your .env file.");
}

// Create a signed token that says "this request comes from user <id>"
export function createToken(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: EXPIRES_IN });
}

// Check a token; returns the payload, or throws if it is fake or expired
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
