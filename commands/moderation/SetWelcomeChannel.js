// commands/setWelcomeChannel.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../db.js");
const { runAsync } = require("../../utils/db.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-welcome-channel")
    .setDescription("Set the channel where welcome messages are sent")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send welcome messages")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel("channel");

      await runAsync(
        `INSERT INTO guild_settings (guild_id, welcome_channel_id)
       VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET welcome_channel_id = ?`,
        [interaction.guild.id, channel.id, channel.id]
      );

      await interaction.reply(
        `✅ Welcome messages will now be sent in ${channel}`
      );
    } catch (err) {
      console.log("Set welcome channel error", err);
    }
  },
};
