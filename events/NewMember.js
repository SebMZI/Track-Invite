const { Events } = require("discord.js");
const { runAsync, getAsync, allAsync } = require("../utils/db.js");

function getDefaultChannelId(guild) {
  const channel = guild.channels.cache.find(
    (c) =>
      c.isTextBased() && c.permissionsFor(guild.members.me).has("SendMessages")
  );
  return channel?.id || null;
}

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      // Fetch latest invites from Discord
      const newInvites = await member.guild.invites.fetch();

      // Fetch invite usage from DB
      const dbInvites = await allAsync(
        `SELECT * FROM invites WHERE guild_id = ?`,
        [member.guild.id]
      );

      // Compare DB usage vs live usage to find which invite was used
      let usedInvite = null;
      for (const invite of newInvites.values()) {
        const dbInvite = dbInvites.find((i) => i.code === invite.code);
        if (!dbInvite) continue;

        if (invite.uses > dbInvite.uses) {
          usedInvite = invite;
          break;
        }
      }

      // fallback if no invite found
      if (!usedInvite) {
        usedInvite = { inviter: null, code: "unknown", uses: 0 };
      }

      // Update DB with this member join
      await runAsync(
        `INSERT INTO member_joins (member_id, inviter_id, invite_code, guild_id)
         VALUES (?, ?, ?, ?)`,
        [
          member.id,
          usedInvite.inviter?.id || null,
          usedInvite.code,
          member.guild.id,
        ]
      );

      // Update the invite usage in DB
      if (usedInvite.code !== "unknown") {
        await runAsync(
          `UPDATE invites SET uses = ? WHERE code = ? AND guild_id = ?`,
          [usedInvite.uses, usedInvite.code, member.guild.id]
        );
      }

      // Count total members invited by this inviter
      let inviteCount = 0;
      if (usedInvite.inviter) {
        const row = await getAsync(
          `SELECT COUNT(*) as count 
           FROM member_joins 
           WHERE inviter_id = ? AND guild_id = ?`,
          [usedInvite.inviter.id, member.guild.id]
        );
        inviteCount = row?.count || 0;
      }

      // Get welcome channel from guild settings
      const guildRow = await getAsync(
        `SELECT welcome_channel_id FROM guild_settings WHERE guild_id = ?`,
        [member.guild.id]
      );
      console.log(guildRow, member.guild.id);
      if (!guildRow) return;

      const channel_id =
        guildRow.welcome_channel_id || getDefaultChannelId(member.guild);
      const channel = member.guild.channels.cache.get(channel_id);

      console.log("Channel");
      if (!channel) return;

      // Send welcome message
      await channel.send(
        `Welcome <@${member.id}> to the server! Invited by ${
          usedInvite.inviter ? `<@${usedInvite.inviter.id}>` : "Unknown"
        } (${inviteCount} invites so far) 🎉`
      );

      console.log("Finih");
    } catch (err) {
      console.error("Error in guildMemberAdd:", err);
    }
  },
};
