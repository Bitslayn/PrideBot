module.exports = {
  data: {
    name: 'menuCrop'
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: `Meow ${interaction.values[0]}`
    });
  }
}