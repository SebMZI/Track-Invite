const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Use absolute path to ensure consistency
const dbPath = path.resolve(__dirname, "invites.db");
console.log(`[DB] Opening database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`[DB] Error opening database at ${dbPath}:`, err);
  } else {
    console.log(`[DB] Database connection established`);
  }
});

module.exports = db;
