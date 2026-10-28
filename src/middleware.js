import { verifyToken } from "./token.js";

// Prints every request that hits the server
export function logger(req, res, next) {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method}  ${req.url}`);
  next();
}

// Checks req.body against a zod schema before the route runs
export function validate(schema) {
  return (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ error: "Send the data as JSON in the request body" });
    }
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }
    req.body = result.data; // cleaned data: trimmed text, default subject
    next();
  };
}

// Lets the request through only with a valid "Authorization: Bearer <token>" header
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Please log in first (missing token)" });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId; // routes use this to know WHO is asking
    next();
  } catch {
    return res.status(401).json({ error: "Your session is invalid or expired. Please log in again." });
  }
}

// Any route not matched
export function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
}

// Any error thrown in a route (for example: invalid JSON in the body)
export function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);
  // Upload problems (file too large, wrong field name) come from multer: client mistakes
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Something went wrong" });
}
