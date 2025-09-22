const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { allAsync } = require("../../utils/db.js");

function IsDateMatchinPattern(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Display the top inviters of the server")
    .addStringOption((option) =>
      option.setName("from").setDescription("Start Date • YYYY-MM-DD")
    )
    .addStringOption((option) =>
      option.setName("to").setDescription("End Date • YYYY-MM-DD")
    ),
  async execute(interaction) {
    try {
      const inviters = await allAsync(
        `SELECT inviter_id, COUNT(*) as count, joined_at
         FROM member_joins
         WHERE guild_id = ?
         GROUP BY inviter_id
         ORDER BY count DESC`,
        [interaction.guild.id]
      );

      if (!inviters || inviters.length === 0) {
        return interaction.reply("No invitations tracked yet.");
      }

      let sortedInviters = inviters.filter(
        (invite) => invite.inviter_id !== null
      );

      const from = interaction.options.getString("from");
      const to = interaction.options.getString("to");

      if (from) {
        if (!IsDateMatchinPattern(from)) {
          return interaction.reply(
            "❌ Invalid 'from' date. Use YYYY-MM-DD format."
          );
        }

        const fromTimestamp = new Date(from).getTime();
        const toTimestamp = to
          ? IsDateMatchinPattern(to)
            ? new Date(to).getTime()
            : (() => {
                interaction.reply(
                  "❌ Invalid 'to' date. Use YYYY-MM-DD format."
                );
                return null;
              })()
          : Date.now();

        if (!toTimestamp) return;
        if (toTimestamp < fromTimestamp) {
          return interaction.reply("❌ 'To' date must be after 'From' date.");
        }

        sortedInviters = sortedInviters.filter(
          (invite) =>
            invite.joined_at > fromTimestamp && invite.joined_at < toTimestamp
        );
      }

      if (sortedInviters.length === 0) {
        return interaction.reply("No invitations found in this date range.");
      }

      const leaderboard = await Promise.all(
        sortedInviters
          .map(async (invite, index) => {
            const member = await interaction.guild.members
              .fetch(invite.inviter_id)
              .catch(() => null);
            const tag = member ? member.user.tag : "Unknown";
            return `**${index + 1}.** ${tag} •  **${invite.count}** invites`;
          })
          .slice(0, 9)
      );

      const embed = new EmbedBuilder()
        .setTitle(
          `🏆 • Leaderboard • Top Inviters in ${interaction.guild.name}`
        )
        .setDescription(leaderboard.join("\n"))
        .setColor("Blue")
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log("Leaderboard", err);
    }
  },
};
