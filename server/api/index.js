// Vercel's Node.js runtime can run an Express app directly if the file
// exports it - no need for a separate serverless-http adapter.
require("dotenv").config();
module.exports = require("../app");
