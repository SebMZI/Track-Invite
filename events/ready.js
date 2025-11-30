const { Events } = require("discord.js");
const { runAsync } = require("../utils/db.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    client.invitesCache = new Map();

    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        client.invitesCache.set(guild.id, invites);

        for (const invite of invites.values()) {
          await runAsync(
            `INSERT OR IGNORE INTO invites (code, inviter_id, channel_id, guild_id, uses) VALUES (?, ?, ?, ?, ?)`,
            [
              invite.code,
              invite.inviter?.id || null,
              invite.channel.id,
              guild.id,
              invite.uses,
            ]
          );
        }
      } catch (err) {
        console.error(`Failed to fetch invites for guild ${guild.id}:`, err);
      }
    }

    console.log("Ready! Invite cache initialized.");
  },
};
