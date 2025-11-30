const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "invites.db");

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log("📝 Initializing database schema...");

      // Run all table creation in series using serialize
      db.serialize(() => {
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
              console.log("✅ Database schema initialized");
              db.close();
              resolve();
            }
          }
        );
      });
    });
  });
}

// If run as script (from Dockerfile)
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("✅ Database setup complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Database setup failed:", err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
