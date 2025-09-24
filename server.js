// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const { renderText } = require('./render.js')

// Init database
const database = {
	guilds: {

	}
}

database.moveSnake = function (game, x, y) {
	let lastPosition = 0

	for (let i = 0; i < game.snake.length; ++i) {
		if (!lastPosition) {
			lastPosition = [game.snake[i][0], game.snake[i][1]]

			game.snake[i][0] += x
			game.snake[i][1] += y
		} else {
			let currentPosition = game.snake[i]

			game.snake[i] = lastPosition

			lastPosition = currentPosition
		}

		for (let j = 0; j < game.apples.length; ++j) {
			if (
				(game.apples[j][0] == game.snake[0][0]) &&
				(game.apples[j][1] == game.snake[0][1])
			) {
				game.score += 1

				game.apples[j][0] = 1
				game.apples[j][1] = 1
			}
		}
	}
}

database.checkForGuildEntry = function (id, name, memberCount) {
	if (!database.guilds[id]) {
		database.guilds[id] = {
			name,
			memberCount,
			game: {
				lastInteractee: 0,
				score: 0,
				snake: [
					[3, 1],
					[2, 1],
					[1, 1]
				],
				apples: [
					[6, 6]
				]
			}
		}
	} else {
		database.guilds[id].name = name
		database.guilds[id].memberCount = memberCount
	}
}

database.formatMessage = function (game) {
	return `\`\`\`\n${renderText(game)}\n\`\`\`
### Score: ${game.score}. Use /up, /down, /left, /right to play!`
}

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const test = "ajajaja"

client.commands = new Collection();

// Loop through commands folder, get all the commands
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isButton()) {
		database.checkForGuildEntry(interaction.guild.id, interaction.guild.name, interaction.guild.memberCount)

		let data = database.guilds[interaction.guild.id]
		let game = data.game

		if (interaction.customId == "up") {
			database.moveSnake(game, 0, -1)
		} else if (interaction.customId == "down") {
			database.moveSnake(game, 0, 1)
		} else if (interaction.customId == "left") {
			database.moveSnake(game, -1, 0)
		} else if (interaction.customId == "right") {
			database.moveSnake(game, 1, 0)
		}

		const up = new ButtonBuilder()
			.setCustomId('up')
			.setLabel('🔼')
			.setStyle(ButtonStyle.Secondary);

		const down = new ButtonBuilder()
			.setCustomId('down')
			.setLabel('🔽')
			.setStyle(ButtonStyle.Secondary);

		const left = new ButtonBuilder()
			.setCustomId('left')
			.setLabel('◀️')
			.setStyle(ButtonStyle.Secondary);

		const right = new ButtonBuilder()
			.setCustomId('right')
			.setLabel('▶️')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(up, down, left, right);

		await interaction.reply({
            content: database.formatMessage(game),
            components: [row]
        })
	}

	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		database.checkForGuildEntry(interaction.guild.id, interaction.guild.name, interaction.guild.memberCount)
		await command.execute(interaction, database);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
