const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./invites.db");

db.run(`
CREATE TABLE IF NOT EXISTS invites (
  code TEXT PRIMARY KEY,
  inviter_id TEXT,
  channel_id TEXT,
  guild_id TEXT,
  uses INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS member_joins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT,
  inviter_id TEXT,
  invite_code TEXT,
  guild_id TEXT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

console.log("✅ Database initialized");
db.close();
