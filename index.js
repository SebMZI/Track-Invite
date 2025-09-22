const { Client, GatewayIntentBits, Events } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites],
});

client.on(Events.InviteCreate, (invite) => {
  console.log("✅ InviteCreate fired!");
  console.log(`Invite code: ${invite.code}, channel: ${invite.channel?.name}`);
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
