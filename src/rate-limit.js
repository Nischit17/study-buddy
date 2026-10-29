// Limit how often one user can call the AI, so one person (or a bot) cannot use up
// the free Gemini quota for everyone. Counts are kept in memory: a restart resets them.
export function rateLimit({ max, windowMs }) {
  const hits = new Map(); // user id → times of their recent requests

  return (req, res, next) => {
    const key = req.userId ?? req.ip; // logged-in user, else their address
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      const waitSeconds = Math.ceil((windowMs - (now - recent[0])) / 1000);
      res.set("Retry-After", String(waitSeconds));
      const error = `Too many AI requests. Try again in ${waitSeconds} seconds.`;
      return res.status(429).json({ error });
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

// One shared budget for every AI route: 10 requests per minute per user
export const aiLimit = rateLimit({ max: 10, windowMs: 60 * 1000 });
