// commands/setWelcomeChannel.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../db.js");

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
    const channel = interaction.options.getChannel("channel");

    db.run(
      `INSERT INTO guild_settings (guild_id, welcome_channel_id)
       VALUES (?, ?)
       ON CONFLICT(guild_id) DO UPDATE SET welcome_channel_id = ?`,
      [interaction.guild.id, channel.id, channel.id]
    );

    await interaction.reply(
      `✅ Welcome messages will now be sent in ${channel}`
    );
  },
};
