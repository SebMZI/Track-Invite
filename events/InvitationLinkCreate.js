const { Events } = require("discord.js");
const db = require("../db");

module.exports = {
  name: Events.InviteCreate,
  async execute(invite) {
    db.run(
      `INSERT INTO invites (code, inviter_id, channel_id, guild_id, uses)
       VALUES (?, ?, ?, ?, ?)`,
      [
        invite.code,
        invite.inviter.id,
        invite.channel.id,
        invite.guild.id,
        invite.uses,
      ]
    );

    const cache = invite.client.invitesCache.get(invite.guild.id) || new Map();
    cache.set(invite.code, invite);
    invite.client.invitesCache.set(invite.guild.id, cache);
  },
};
