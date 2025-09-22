const { Events } = require("discord.js");
const db = require("../db");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Error!", ephemeral: true });
      } else {
        await interaction.reply({ content: "Error!", ephemeral: true });
      }
    }
  },
};
