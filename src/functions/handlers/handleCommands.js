const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync('./src/commands');
    client.commandArray = [];
    for (folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({
      version: '9'
    }).setToken(process.env.token);

    (async () => {
      try {
        console.log('Refreshing & Deleting');

        await rest.put(Routes.applicationCommands(process.env.clientId), {
          body: client.commandArray
        });

        console.log('Success!');
      } catch (error) {
        console.error(error);
      }
    })();
  };
};
