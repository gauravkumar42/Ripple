// Populates the database with a few demo users and posts.
// Usage: npm run seed   (make sure schema.sql has been run first)
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./pool");

async function seed() {
    const passwordHash = await bcrypt.hash("password123", 10);

    const users = ["gauravraukari", "reeteshkumar", "prashantkumar"];
    const userIds = [];

    for (const username of users) {
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE username = username`,
            [username, `${username}@example.com`, passwordHash]
        );
        const [rows] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
        userIds.push(rows[0].id);
    }

    const [existingPosts] = await pool.query("SELECT COUNT(*) AS count FROM posts");
    if (existingPosts[0].count === 0) {
        const [post1] = await pool.query(
            "INSERT INTO posts (user_id, content) VALUES (?, ?)",
            [userIds[0], "I love coding!"]
        );
        const [post2] = await pool.query(
            "INSERT INTO posts (user_id, content) VALUES (?, ?)",
            [userIds[1], "Hard work is important to achieve success"]
        );
        await pool.query(
            "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)",
            [post2.insertId, userIds[2], "Well said!"]
        );
        await pool.query(
            "INSERT INTO posts (user_id, content) VALUES (?, ?)",
            [userIds[2], "I am a JEE aspirant"]
        );
        await pool.query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [post1.insertId, userIds[1]]);
    }

    console.log("Seed complete. Demo users: gauravraukari / reeteshkumar / prashantkumar, password: password123");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
