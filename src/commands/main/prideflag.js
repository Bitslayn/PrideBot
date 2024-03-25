const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prideflag')
    .setDescription('Prideflag commands for this bot')
    .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create a prideflag emoji from an attachment')
      .addAttachmentOption(option => option.setName('attachment').setDescription('Attach an image to create an emoji from').setRequired(true))
      .addStringOption(option => option.setName('crop').setDescription('Configure how prideflags will be cropped').addChoices(
        { name: 'Center (Default)', value: '-1' },
        { name: 'Left', value: '0' },
        { name: 'Right', value: '-2' }/*,
        { name: 'Full', value: 'option_full' }*/
      ))
      /*.addBooleanOption(option => option.setName('vectorize').setDescription('Whether or not to upscale the prideflag to 512x512'))*/
      /*.addSubcommand(subcommand => subcommand.setName('info').setDescription('Read information about an existing prideflag emoji'))*/),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'create') {
      const attachment = interaction.options.getAttachment('attachment');

      const scale = 512;
      const height = scale * 0.72265625;
      const width = 370 * attachment.width / attachment.height;
      const crop = interaction.options.getString('crop') ?? '-1';
      const dx = (width - scale) / 2 * crop;
      const dy = (scale - height) / 2;

      const canvas = Canvas.createCanvas(scale, scale);
      const context = canvas.getContext('2d');
      const mask = await Canvas.loadImage('./src/masks/flag.png')
      context.drawImage(mask, 0, 0);
      context.globalCompositeOperation = 'source-in';
      const flag = await Canvas.loadImage(attachment.url)
      context.drawImage(flag, dx, dy, width, height);
      const output = new AttachmentBuilder(await canvas.encode('png'), { name: attachment.name });

      if (attachment) {
        await interaction.reply({ files: [output] });
      } else {
        await interaction.reply({ content: 'Please provide an image by attaching, replying, or sending its link.' });
      }
    }
  }
}