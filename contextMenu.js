const {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  Message,
  MessageCollector
} = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Prideflag emoji')
    .setType(ApplicationCommandType.Message),
  async execute(interaction, client) {
    const attachment = Array.from(
      interaction.targetMessage.attachments.values()
    );
    const crop = '-1';

    const scale = 512;
    const height = scale * 0.72265625;
    const width =
      (370 * attachment.map(({ width }) => width).toString()) /
      attachment.map(({ height }) => height).toString();
    const dx = ((width - scale) / 2) * parseInt(crop);
    const dy = (scale - height) / 2;

    const canvas = Canvas.createCanvas(scale, scale);
    const context = canvas.getContext('2d');
    const mask = await Canvas.loadImage('./src/masks/flag.png');
    context.drawImage(mask, 0, 0);
    context.globalCompositeOperation = 'source-in';
    const flag = await Canvas.loadImage(
      attachment.map(({ url }) => url).toString()
    );
    context.drawImage(flag, dx, dy, width, height);
    const output = new AttachmentBuilder(await canvas.encode('png'), {
      name: attachment.map(({ name }) => name).toString()
    });

    if (attachment) {
      await interaction.reply({ files: [output] });
    } else {
      await interaction.reply({
        content:
          'Please provide an image by attaching, replying, or sending its link.'
      });
    }
  }
};
