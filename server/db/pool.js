const mysql = require("mysql2/promise");

// On Vercel each serverless invocation can spin up its own process, so we
// keep the pool small and reuse it across warm invocations via a module-level
// singleton (Node caches required modules between warm invocations).
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 1 : 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
});

module.exports = pool;
