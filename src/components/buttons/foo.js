module.exports = {
  data: {
    name: 'foo'
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: 'bar'
    });
  }
};
