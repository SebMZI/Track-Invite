const { Events } = require("discord.js");
const db = require("../db.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    for (const guild of client.guilds.cache.values()) {
      const invites = await guild.invites.fetch();
      client.invitesCache.set(guild.id, invites);

      invites.forEach((invite) => {
        db.run(
          `INSERT OR IGNORE INTO invites (code, inviter_id, channel_id, guild_id, uses) VALUES (?, ?, ?, ?, ?)`,
          [
            invite.code,
            invite.inviter.id,
            invite.channel.id,
            guild.id,
            invite.uses,
          ]
        );
      });
      db.close();
    }

    console.log("Ready!");
  },
};
