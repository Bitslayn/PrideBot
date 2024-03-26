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
  data: new SlashCommandBuilder()
    .setName('prideflag')
    .setDescription('Prideflag commands for this bot')
    .addSubcommand(
      (subcommand) =>
        subcommand
          .setName('create')
          .setDescription('Create a prideflag emoji from an attachment')
          .addAttachmentOption((option) =>
            option
              .setName('attachment')
              .setDescription('Attach an image to create an emoji from')
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName('crop')
              .setDescription('Configure how prideflags will be cropped')
              .addChoices(
                { name: 'Center (Default)', value: '-1' },
                { name: 'Left', value: '0' },
                { name: 'Right', value: '-2' }
                /*{ name: 'Full', value: '1' }*/
              )
          )
      /*.addBooleanOption(option => option.setName('vectorize').setDescription('Whether or not to upscale the prideflag to 512x512'))*/
      /*.addSubcommand(subcommand => subcommand.setName('info').setDescription('Read information about an existing prideflag emoji'))*/
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'create') {
      const attachment = interaction.options.getAttachment('attachment');

      const scale = 512;
      const height = scale * 0.72265625;
      const width = (370 * attachment.width) / attachment.height;
      const crop = interaction.options.getString('crop') ?? '-1';
      const dx = ((width - scale) / 2) * crop;
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
        await interaction.reply({ files: [output] });
      } else {
        await interaction.reply({
          content:
            'Please provide an image by attaching, replying, or sending its link.'
        });
      }
    }
    // },
    // data: new ContextMenuCommandBuilder()
    //   .setName('flag')
    //   .setType(ApplicationCommandType.Message),
    // async execute(interaction, client) {
    //   /*const canvas = createCanvas(512, 512);
    // const context = canvas.getContext('2d');

    // const flag = new Image();
    // Image.src = interaction.attachments.array()[0].url
    // */
    //   const img = `${Array.from(interaction.targetMessage.attachments.values()).map(({ url }) => url)}`;
    //   console.log(img, img.length);

    //   // Selection menu component
    //   const menuSelection = new StringSelectMenuBuilder()
    //     .setCustomId('menuSelection')
    //     .setPlaceholder('Selection Area')
    //     .setMinValues(1)
    //     .setMaxValues(1)
    //     .setOptions(
    //       new StringSelectMenuOptionBuilder({
    //         label: '⬤ Centered (Default)',
    //         description: 'Wide flags will be cropped along either side',
    //         value: 'center'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: '[◖ Left',
    //         description:
    //           'Keeps the left side of wide flags, cropping out the right',
    //         value: 'left'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: '◗] Right',
    //         description:
    //           'Keeps the right side of wide flags, cropping out the left',
    //         value: 'right'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: '[⬮] Stretch',
    //         description:
    //           '(Not recommended) Resizes wide flags to fit the template',
    //         value: 'stretch'
    //       })
    //     );

    //   // Emoji shape menu component
    //   const menuShape = new StringSelectMenuBuilder()
    //     .setCustomId('menuShape')
    //     .setPlaceholder('Custom Shape')
    //     .setMinValues(1)
    //     .setMaxValues(1)
    //     .setOptions(
    //       new StringSelectMenuOptionBuilder({
    //         label: 'Flag (Default)',
    //         emoji: {
    //           id: '625891304148303894',
    //           name: 'rogue'
    //         },
    //         value: 'flag'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: 'Waving Flag',
    //         emoji: {
    //           id: '625891304148303894',
    //           name: 'rogue'
    //         },
    //         value: 'waving'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: 'Heart',
    //         emoji: {
    //           id: '625891304148303894',
    //           name: 'rogue'
    //         },
    //         value: 'heart'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: 'Circle',
    //         emoji: {
    //           id: '625891304148303894',
    //           name: 'rogue'
    //         },
    //         value: 'circle'
    //       }),
    //       new StringSelectMenuOptionBuilder({
    //         label: 'Square',
    //         emoji: {
    //           id: '625891304148303894',
    //           name: 'rogue'
    //         },
    //         value: 'square'
    //       })
    //     );

    //   // Button components
    //   const buttonPreview = new ButtonBuilder()
    //     .setCustomId('preview')
    //     .setLabel('Preview Selecton')
    //     .setStyle(ButtonStyle.Secondary);

    //   const buttonRevert = new ButtonBuilder()
    //     .setCustomId('revert')
    //     .setLabel('Revert Changes')
    //     .setStyle(ButtonStyle.Secondary);

    //   const buttonConvert = new ButtonBuilder()
    //     .setCustomId('convert')
    //     .setLabel('Convert')
    //     .setStyle(ButtonStyle.Success);

    //   const buttonCancel = new ButtonBuilder()
    //     .setCustomId('cancel')
    //     .setLabel('Cancel')
    //     .setStyle(ButtonStyle.Danger);

    //   const buttonPrevious = new ButtonBuilder()
    //     .setCustomId('previous')
    //     .setLabel('🡄 Prev')
    //     .setStyle(ButtonStyle.Primary);

    //   const buttonNext = new ButtonBuilder()
    //     .setCustomId('next')
    //     .setLabel('Next 🡆')
    //     .setStyle(ButtonStyle.Primary);

    //   // Response builder
    //   if (img.length != 0) {
    //     await interaction.reply({
    //       content: img[0],
    //       components: [
    //         new ActionRowBuilder().addComponents(menuSelection),
    //         //new ActionRowBuilder().addComponents(menuShape),
    //         new ActionRowBuilder().addComponents(
    //           /*buttonPreview, buttonRevert,*/ buttonConvert,
    //           buttonCancel
    //         )
    //         //new ActionRowBuilder().addComponents(buttonPrevious, buttonNext)
    //       ]
    //     });
    //   } else {
    //     interaction.reply({ content: '.', ephemeral: true });
    //     interaction.deleteReply();
    //   }
  }
};
