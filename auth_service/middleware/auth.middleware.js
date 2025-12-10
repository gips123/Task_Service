const jwt = require("jsonwebtoken");
const db = require("../db.js");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Access token required" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = {
            id: users[0].id,
            email: users[0].email,
            name: users[0].name,
            provider: users[0].provider
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        return res.status(500).json({ error: "Authentication failed" });
    }
};

const authenticateTokenGateway = (req, res, next) => {
    const publicPaths = [
        '/auth/login',
        '/auth/register',
    ];

    const path = req.path;
    const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

    if (isPublicPath) {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: Access token required. Please login first." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized: Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Unauthorized: Invalid token. Please login again." });
        }
        return res.status(401).json({ error: "Unauthorized: Authentication failed." });
    }
};

module.exports = { authenticateToken, authenticateTokenGateway };

