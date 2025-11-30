const fs = require("fs");

async function initializeDatabase(db) {
  const dbPath = "./invites.db";
  const dbExists = fs.existsSync(dbPath);

  if (dbExists) {
    console.log("📦 Database found, checking schema...");
  }

  return new Promise((resolve, reject) => {
    let completed = 0;
    const total = 3;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        console.log("✅ Database ready");
        resolve();
      }
    };

    db.run(
      `
      CREATE TABLE IF NOT EXISTS invites (
        code TEXT PRIMARY KEY,
        inviter_id TEXT,
        channel_id TEXT,
        guild_id TEXT,
        uses INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) reject(err);
        else checkComplete();
      }
    );

    db.run(
      `
      CREATE TABLE IF NOT EXISTS member_joins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id TEXT,
        inviter_id TEXT,
        invite_code TEXT,
        guild_id TEXT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) reject(err);
        else checkComplete();
      }
    );

    db.run(
      `
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        welcome_channel_id TEXT
      )
    `,
      (err) => {
        if (err) reject(err);
        else checkComplete();
      }
    );
  });
}

module.exports = { initializeDatabase };
