const jwt = require("jsonwebtoken");

// Requires a valid JWT. Attaches { id, username } to req.user.
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id, username: payload.username };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

// Decodes the token if present, but doesn't fail the request without one.
// Used on public routes that behave slightly differently for logged-in users
// (e.g. showing whether *you* liked a post).
function optionalAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: payload.id, username: payload.username };
        } catch (err) {
            // Ignore invalid tokens on optional routes
        }
    }

    next();
}

module.exports = { requireAuth, optionalAuth };
