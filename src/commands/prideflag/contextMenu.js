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
    .setName('flag')
    .setType(ApplicationCommandType.Message),
  async execute(interaction, client) {
    /*const canvas = createCanvas(512, 512);
     const context = canvas.getContext('2d');

     const flag = new Image();
     Image.src = interaction.attachments.array()[0].url
     */
    const img = `${Array.from(interaction.targetMessage.attachments.values()).map(({ url }) => url)}`;
    console.log(img, img.length);

    // Selection menu component
    const menuSelection = new StringSelectMenuBuilder()
      .setCustomId('menuSelection')
      .setPlaceholder('Selection Area')
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          label: '⬤ Centered (Default)',
          description: 'Wide flags will be cropped along either side',
          value: 'center'
        }),
        new StringSelectMenuOptionBuilder({
          label: '[◖ Left',
          description:
            'Keeps the left side of wide flags, cropping out the right',
          value: 'left'
        }),
        new StringSelectMenuOptionBuilder({
          label: '◗] Right',
          description:
            'Keeps the right side of wide flags, cropping out the left',
          value: 'right'
        }),
        new StringSelectMenuOptionBuilder({
          label: '[⬮] Stretch',
          description:
            '(Not recommended) Resizes wide flags to fit the template',
          value: 'stretch'
        })
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

    // Response builder
    if (img.length != 0) {
      await interaction.reply({
        content: img[0],
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
    } else {
      interaction.reply({ content: '.', ephemeral: true });
      interaction.deleteReply();
    }
  }
};
