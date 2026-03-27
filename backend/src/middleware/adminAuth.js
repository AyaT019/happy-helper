export function requireAdmin(req, res, next) {
  const header = req.headers["x-admin-password"];
  // Fallback default so the app works out of the box.
  // For production, set ADMIN_PASSWORD in `backend/.env`.
  const expected = process.env.ADMIN_PASSWORD || "stickyy2026";

  if (!header || header !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

