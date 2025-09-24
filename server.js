// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const { renderText } = require('./render.js');
const { data } = require('./commands/utils/play.js');

// Init database
const database = {
	currentModifier: "cheese",
	guilds: {

	}
}

database.moveSnake = function (game, x, y) {
	let lastPosition = 0

	// If game over, reset to normal when moving instead of making another move.
	if (game.gameOver) {
		game.snake = [
			[3, 1],
			[2, 1],
			[1, 1]
		]

		if (database.currentModifier == "cheese") {
			game.snake = [
				[6, 1, 1],
				[5, 1, 0],
				[4, 1, 1],
				[3, 1, 0],
				[2, 1, 1],
				[1, 1, 0]
			]
		}

		game.apples = [
			[8, 7]
		]

		if (database.currentModifier == "threeFruits") {
			game.apples = [
				[8, 7],
				[4, 11],
				[12, 3]
			]
		}

		game.walls = [

		]
		game.score = 0

		game.gameOver = false

		return
	}

	for (let i = 0; i < game.snake.length; ++i) {
		if (!lastPosition) {
			lastPosition = [game.snake[i][0], game.snake[i][1], game.snake[i][2]]

			game.snake[i][0] += x
			game.snake[i][1] += y

			if (database.currentModifier == "cheese") {
				game.snake[i][2] = (game.snake[i][2] == 0) ? 1 : 0
			}
		} else {
			let currentPosition = game.snake[i]

			game.snake[i] = lastPosition

			lastPosition = currentPosition
		}
	}

	for (let j = 0; j < game.apples.length; ++j) {
		if (
			(game.apples[j][0] == game.snake[0][0]) &&
			(game.apples[j][1] == game.snake[0][1])
		) {
			game.score += 1

			game.snake.push(lastPosition)

			let correctSpot = false

			while (!correctSpot) {
				game.apples[j][0] = Math.floor(Math.random() * 15)
				game.apples[j][1] = Math.floor(Math.random() * 17)

				correctSpot = true

				for (let k = 0; k < game.snake.length; ++k) {
					if (
						(game.apples[j][0] == game.snake[k][0]) &&
						(game.apples[j][1] == game.snake[k][1])
					) {
						correctSpot = false
					}
				}

				for (let k = 0; k < game.walls.length; ++k) {
					if (
						(game.apples[j][0] == game.walls[k][0]) &&
						(game.apples[j][1] == game.walls[k][1])
					) {
						correctSpot = false
					}
				}

				for (let k = 0; k < game.apples.length; ++k) {
					if (
						(game.apples[j][0] == game.apples[k][0]) &&
						(game.apples[j][1] == game.apples[k][1]) &&
						(j != k)
					) {
						correctSpot = false
					}
				}
			}
		}
	}

	for (let j = 0; j < game.walls.length; ++j) {
		if (
			(game.walls[j][0] == game.snake[0][0]) &&
			(game.walls[j][1] == game.snake[0][1])
		) {
			game.gameOver = true

			break
		}
	}

	for (let j = 1; j < game.snake.length; ++j) {
		if (
			(game.snake[j][0] == game.snake[0][0]) &&
			(game.snake[j][1] == game.snake[0][1]) &&
			(game.snake[j][2] != 0)
		) {
			console.log(game.snake[j][2])
			game.gameOver = true

			break
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
				gameOver: true,
				snake: [
				],
				apples: [
				],
				walls: [

				]
			}
		}
	} else {
		database.guilds[id].name = name
		database.guilds[id].memberCount = memberCount
	}
}

database.formatMessage = function (game) {
	if (game.gameOver) {
		return `\`\`\`\n${renderText(game)}\n\`\`\`
# GAME OVER! :(
## Final score: ${game.score}. Click any button below to reset.`
	} else if (game.gameWon) {
		return `\`\`\`\n${renderText(game)}\n\`\`\`
# YOU WIN! :D
## Final score: ${game.score}. Click any button below to reset.`
	} else if (game.gameReset) {
		return `\`\`\`\n${renderText(game)}\n\`\`\`
# GAME END!
## You've run out of time. Leaderboard and modifiers have been reset.
## Final score: ${game.score}. Click any button below to reset.`
	} {
		return `\`\`\`\n${renderText(game)}\n\`\`\`
## Score: ${game.score}. Click the buttons below to play!`
	}
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

		if (game.lastInteractee == interaction.user.id && false) {
			await interaction.reply({
				content: "**You can't make two turns in a row!** Let someone else have a turn first.",
				ephemeral: true
			})

			return
		}

		game.lastInteractee = interaction.user.id

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
