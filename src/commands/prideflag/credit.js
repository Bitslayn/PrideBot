const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credit')
    .setDescription('Credits to those who helped make the bot'),
  async execute(interaction) {
    await interaction.reply({
      content: `Bot programmed by <@372268045927972864>\nAvatar created by <@929403668342661171> Their name is Pride Bot and their pronouns are (it/them)`,
      allowedMentions: { parse: [] }
    });
  }
};
