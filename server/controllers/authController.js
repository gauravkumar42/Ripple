const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db/pool");
const { isValidEmail, isValidUsername, isNonEmptyString } = require("../utils/validate");

function signToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
}

async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;

        if (!isValidUsername(username)) {
            return res.status(400).json({
                error: "Username must be 3-20 characters (letters, numbers, underscores only)",
            });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "A valid email is required" });
        }
        if (!isNonEmptyString(password, 72) || password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username.trim(), email.trim().toLowerCase(), passwordHash]
        );

        const user = { id: result.insertId, username: username.trim() };
        const token = signToken(user);

        res.status(201).json({ token, user });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const [rows] = await pool.query(
            "SELECT id, username, password_hash FROM users WHERE username = ? OR email = ?",
            [username.trim(), username.trim().toLowerCase()]
        );

        const dbUser = rows[0];
        // Compare against a dummy hash even when the user doesn't exist, so
        // the response time doesn't leak whether the username is registered.
        const passwordHash = dbUser ? dbUser.password_hash : "$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsaltin";
        const passwordMatches = await bcrypt.compare(password, passwordHash);

        if (!dbUser || !passwordMatches) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = { id: dbUser.id, username: dbUser.username };
        const token = signToken(user);

        res.json({ token, user });
    } catch (err) {
        next(err);
    }
}

async function me(req, res) {
    res.json({ user: req.user });
}

module.exports = { register, login, me };
