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
} = require("discord.js");
const { convertImageToFlag } = require("./shapes/flag");
const { stretchImageAlongCurve } = require("./shapes/rainbow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prideflag")
    .setDescription("Prideflag commands for this bot")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a prideflag emoji from an attachment")
        .addAttachmentOption((option) =>
          option
            .setName("attachment")
            .setDescription("Attach an image to create an emoji from")
            .setRequired(true)
        )
        /*.addStringOption((option) =>
          option.setName('url').setDescription('The url of the prideflag image')
        )*/
        .addStringOption((option) =>
          option
            .setName("crop")
            .setDescription("Configure how prideflags will be cropped")
            .addChoices(
              { name: "Center (Default)", value: "-1" },
              { name: "Left", value: "0" },
              { name: "Right", value: "-2" },
              { name: "Stretch", value: "0full" }
            )
        )
        // .addStringOption((option) =>
        //   option
        //     .setName("shape")
        //     .setDescription("Which shape should the flag be?")
        //     .addChoices(
        //       { name: "Flag (Default)", value: "flag" },
        //       { name: "Rainbow", value: "rainbow" }
        //     )
        // )
        .addBooleanOption((option) =>
          option
            .setName("send")
            .setDescription("Should the bot's response be visible to everyone?")
        )
    ),

  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "create") {
      const attachment =
        interaction.options.getAttachment("attachment") ??
        interaction.options.getString("url");
      console.log(`${attachment.url}`);

      const crop = interaction.options.getString("crop") ?? "-1";
      const scale = 512;

      const shape = interaction.options.getString("shape") ?? "flag";
      const send = !(interaction.options.getBoolean("send") ?? true);

      await interaction.deferReply({ ephemeral: send });

      try {
        let canvas;
        if (shape == "flag") {
          canvas = await convertImageToFlag(attachment, scale, crop);
        } else if (shape == "rainbow") {
          canvas = await stretchImageAlongCurve(attachment, scale);
        }

        const buffer = await canvas.encode("png");
        const output = new AttachmentBuilder(buffer, {
          name: attachment.name.replace(/\.[^/.]+$/, ".png")
        });

        if (attachment || url) {
          {
            const height = scale * 0.72265625;
            function findWidth() { // width = 512
              if (crop == "0full") {
                return scale;
              } else {
                return (height * attachment.width) / attachment.height;
              }
            }
            const width = findWidth();
            if (width < scale && shape == "flag") {
              await interaction.editReply({ files: [output], content: '-# Try adding **crop: Stretch** if the flag looks weird', ephemeral: send })
            } else {
              await interaction.editReply({ files: [output], ephemeral: send });
            }
          }
        } else {
          await interaction.editReply({
            content: "Please attach an image or link",
            ephemeral: send
          });
        }
      } catch (error) {
        console.error("Error processing image:", error);
        interaction.editReply({
          content: "There was an error processing the image.",
          ephemeral: send
        });
      }
    }
  }
};
