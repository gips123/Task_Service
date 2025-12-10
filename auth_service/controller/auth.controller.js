const db = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

exports.register = async (req, res) => {
    try {
        const { name, email, password, provider = "EmailPassword" } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE email = ? AND provider = ?",
            [email, provider]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (name, email, provider, password_hash) VALUES (?, ?, ?, ?)",
            [name, email, provider, passwordHash]
        );

        const userId = result.insertId;

        const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user = newUser[0];

        const token = jwt.sign(
            { id: userId, email, name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('Register successful - Email:', email);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                provider: user.provider,
                created_at: user.created_at
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        res.status(500).json({ error: err.toString() });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, provider = "EmailPassword" } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ? AND provider = ?",
            [email, provider]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = users[0];

        if (!user.password_hash) {
            return res.status(401).json({ error: "Invalid authentication method. This account does not have a password set." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('Login successful - Email:', user.email);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                created_at: user.created_at
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        res.json({
            valid: true,
            user: {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                provider: users[0].provider
            }
        });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        res.status(500).json({ error: err.toString() });
    }
};

