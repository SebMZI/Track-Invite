const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
const { initializeDatabase } = require("./init_db.js");

// Check if database is corrupted and recreate if needed
const dbPath = "./invites.db";
const dbCorrupted = process.env.RESET_DB === "true";
if (dbCorrupted && fs.existsSync(dbPath)) {
  console.log("🔄 Resetting database...");
  fs.unlinkSync(dbPath);
}

// Load db AFTER checking for reset
const db = require("./db.js");

// Create a flag to ensure DB is initialized before Discord events fire
let dbInitialized = false;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

async function loadCommands() {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}

async function loadEvents() {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

async function start() {
  try {
    await initializeDatabase(db);
    dbInitialized = true; // Mark DB as ready
    console.log("📦 Database ready, starting Discord bot...");

    await loadCommands();
    await loadEvents();

    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

start();
