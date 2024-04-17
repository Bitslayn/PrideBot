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
  data: new SlashCommandBuilder()
    .setName('prideflag')
    .setDescription('Prideflag commands for this bot')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Create a prideflag emoji from an attachment')
        .addAttachmentOption((option) =>
          option
            .setName('attachment')
            .setDescription('Attach an image to create an emoji from')
            .setRequired(true)
        )
        /*.addStringOption((option) =>
          option.setName('url').setDescription('The url of the prideflag image')
        )*/
        .addStringOption((option) =>
          option
            .setName('crop')
            .setDescription('Configure how prideflags will be cropped')
            .addChoices(
              { name: 'Center (Default)', value: '-1' },
              { name: 'Left', value: '0' },
              { name: 'Right', value: '-2' },
              { name: 'Stretch', value: '0full' }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName('send')
            .setDescription("Should the bot's response be visible to everyone?")
        )
    ),
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === 'create') {
      const attachment = interaction.options.getAttachment('attachment') ?? interaction.options.getString('url');
      const crop = interaction.options.getString('crop') ?? '-1';
      const send = !interaction.options.getBoolean('send') ?? false;

      console.log(`${attachment.url}`);

      const scale = 512;
      const height = scale * 0.72265625;
      const width =
        crop !== '0full' ?
          (370 * attachment.width) / attachment.height
        : Math.min(512, (370 * attachment.width) / attachment.height);
      const dx = ((width - scale) / 2) * parseInt(crop);
      const dy = (scale - height) / 2;

      const canvas = Canvas.createCanvas(scale, scale);
      const context = canvas.getContext('2d');
      const mask = await Canvas.loadImage('./src/masks/flag.png');
      context.drawImage(mask, 0, 0);
      context.globalCompositeOperation = 'source-in';
      const flag = await Canvas.loadImage(attachment.url);
      context.drawImage(flag, dx, dy, width, height);
      const output = new AttachmentBuilder(await canvas.encode('png'), {
        name: attachment.name
      });

      if (attachment) {
        await interaction.reply({ files: [output], ephemeral: send });
      } else {
        await interaction.reply({
          content:
            'Please attach an image or link',
          ephemeral: send
        });
      }
    }
  }
};
