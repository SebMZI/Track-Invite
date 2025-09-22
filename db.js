const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./invites.db");

module.exports = db;
