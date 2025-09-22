const { Events } = require("discord.js");
const db = require("../db");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const cachedInvites = member.client.invitesCache.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();

    const usedInvite = newInvites.find(
      (i) => cachedInvites.get(i.code)?.uses < i.uses
    );
    if (!usedInvite) return;

    member.client.invitesCache.set(member.guild.id, newInvites);

    db.run(
      `INSERT INTO member_joins (member_id, inviter_id, invite_code, guild_id)
       VALUES (?, ?, ?, ?)`,
      [member.id, usedInvite.inviter.id, usedInvite.code, member.guild.id]
    );

    db.run(`UPDATE invites SET uses = ? WHERE code = ? AND guild_id = ?`, [
      usedInvite.uses,
      usedInvite.code,
      member.guild.id,
    ]);
  },
};
