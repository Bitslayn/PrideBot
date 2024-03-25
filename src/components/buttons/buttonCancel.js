module.exports = {
  data: {
    name: 'cancel'
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: 'bar'
    });
  }
}