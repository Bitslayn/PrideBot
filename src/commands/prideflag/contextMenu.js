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
  UserContextMenuCommandInteraction
} = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Create prideflag emoji')
    .setType(ApplicationCommandType.Message),
  async execute(interaction) {
    // Selection menu component
    const menuSelection = new StringSelectMenuBuilder()
      .setCustomId('menuSelection')
      .setPlaceholder('Selection Area')
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          label: 'Center (Default)',
          description: 'Wide flags will be cropped along either side',
          value: 'center'
        }),
        new StringSelectMenuOptionBuilder({
          label: 'Left',
          description:
            'Keeps the left side of wide flags, cropping out the right',
          value: 'left'
        }),
        new StringSelectMenuOptionBuilder({
          label: 'Right',
          description:
            'Keeps the right side of wide flags, cropping out the left',
          value: 'right'
        }) /*,
        new StringSelectMenuOptionBuilder({
          label: '[⬮] Stretch',
          description:
            '(Not recommended) Resizes wide flags to fit the template',
          value: 'stretch'
        })*/
      );

    // Emoji shape menu component
    const menuShape = new StringSelectMenuBuilder()
      .setCustomId('menuShape')
      .setPlaceholder('Custom Shape')
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          label: 'Flag (Default)',
          emoji: {
            id: '625891304148303894',
            name: 'rogue'
          },
          value: 'flag'
        }),
        new StringSelectMenuOptionBuilder({
          label: 'Waving Flag',
          emoji: {
            id: '625891304148303894',
            name: 'rogue'
          },
          value: 'waving'
        }),
        new StringSelectMenuOptionBuilder({
          label: 'Heart',
          emoji: {
            id: '625891304148303894',
            name: 'rogue'
          },
          value: 'heart'
        }),
        new StringSelectMenuOptionBuilder({
          label: 'Circle',
          emoji: {
            id: '625891304148303894',
            name: 'rogue'
          },
          value: 'circle'
        }),
        new StringSelectMenuOptionBuilder({
          label: 'Square',
          emoji: {
            id: '625891304148303894',
            name: 'rogue'
          },
          value: 'square'
        })
      );

    // Button components
    const buttonPreview = new ButtonBuilder()
      .setCustomId('preview')
      .setLabel('Preview Selecton')
      .setStyle(ButtonStyle.Secondary);

    const buttonRevert = new ButtonBuilder()
      .setCustomId('revert')
      .setLabel('Revert Changes')
      .setStyle(ButtonStyle.Secondary);

    const buttonConvert = new ButtonBuilder()
      .setCustomId('convert')
      .setLabel('Convert')
      .setStyle(ButtonStyle.Success);

    const buttonCancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);

    const buttonPrevious = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('🡄 Prev')
      .setStyle(ButtonStyle.Primary);

    const buttonNext = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next 🡆')
      .setStyle(ButtonStyle.Primary);

    // Edit flag emoji
    const attachment = Array.from(
      interaction.targetMessage.attachments.values()
    );

    const scale = 512;
    const height = scale * 0.72265625;
    const width =
      (370 * attachment.map(({ width }) => width).toString()) /
      attachment.map(({ height }) => height).toString();
    const crop = '-1';
    const dx = ((width - scale) / 2) * crop;
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

    // Response builder
    await interaction.reply({
      files: [output],
      components: [
        new ActionRowBuilder().addComponents(menuSelection),
        //new ActionRowBuilder().addComponents(menuShape),
        new ActionRowBuilder().addComponents(
          /*buttonPreview, buttonRevert,*/ buttonConvert,
          buttonCancel
        )
        //new ActionRowBuilder().addComponents(buttonPrevious, buttonNext)
      ]
    });
  }
};
