const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

async function initializeDatabase(db) {
  const dbPath = "./invites.db";
  const dbExists = fs.existsSync(dbPath);

  if (dbExists) {
    console.log("📦 Database found, checking schema...");
  } else {
    console.log("📝 Creating new database...");
  }

  return new Promise((resolve, reject) => {
    let completed = 0;
    const total = 3;

    const checkComplete = () => {
      completed++;
      console.log(`[Schema] Created table (${completed}/${total})`);
      if (completed === total) {
        console.log("✅ Database ready");
        resolve();
      }
    };

    db.run(
      `CREATE TABLE IF NOT EXISTS invites (
        code TEXT PRIMARY KEY,
        inviter_id TEXT,
        channel_id TEXT,
        guild_id TEXT,
        uses INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("❌ Error creating invites table:", err);
          reject(err);
        } else {
          checkComplete();
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS member_joins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id TEXT,
        inviter_id TEXT,
        invite_code TEXT,
        guild_id TEXT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("❌ Error creating member_joins table:", err);
          reject(err);
        } else {
          checkComplete();
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        welcome_channel_id TEXT
      )`,
      (err) => {
        if (err) {
          console.error("❌ Error creating guild_settings table:", err);
          reject(err);
        } else {
          checkComplete();
        }
      }
    );
  });
}

// Support running as standalone script (from Dockerfile)
if (require.main === module) {
  const db = new sqlite3.Database("./invites.db");

  initializeDatabase(db)
    .then(() => {
      console.log("✅ Standalone initialization completed");
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
          process.exit(1);
        }
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error("❌ Standalone initialization failed:", err);
      db.close();
      process.exit(1);
    });
} else {
  // Export for use as module
  module.exports = { initializeDatabase };
}
