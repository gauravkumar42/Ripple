const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function resolveSsl() {
    if (process.env.DB_SSL !== "true") return undefined;

    // On Vercel we can't ship the certs/ folder (it's gitignored), so the CA
    // cert is passed in as an environment variable instead.
    if (process.env.DB_CA_CERT) {
        return { ca: process.env.DB_CA_CERT, rejectUnauthorized: true };
    }

    // Locally, read it from the certs/ folder
    const caPath = path.join(__dirname, "..", "certs", "ca.pem");
    if (fs.existsSync(caPath)) {
        return { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true };
    }

    return { rejectUnauthorized: true };
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 1 : 10,
    queueLimit: 0,
    ssl: resolveSsl(),
});

module.exports = pool;