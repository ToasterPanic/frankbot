// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { renderText } = require('./render.js');
const { data } = require('./commands/utils/play.js');

const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'))

// Init database
const database = {
	currentModifier: "standard",
	currentFruit: config.fruitTypes[0],
	guilds: {

	},
	boardSizeX: config.defaultBoardSizeX,
	boardSizeY: config.defaultBoardSizeY,
	currentDay: 0,
}

// The function that moves the snake. Why is it in the bot's database? Only God knows.
database.moveSnake = function (game, x, y) {
	let lastPosition = 0

	game.moves += 1

	// If game over, reset to normal when moving instead of making another move.
	if (game.gameOver) {
		game.snake = [
			[5, 1, 0],
			[4, 1, 0],
			[3, 1, 0],
			[2, 1, 0],
			[1, 1, 0]
		]

		if (database.currentModifier == "cheese") {
			game.snake = [
				[5, 1, 0],
				[4, 1, 1],
				[3, 1, 0],
				[2, 1, 1],
				[1, 1, 0]
			]
		}

		game.apples = [
			[Math.ceil(database.boardSizeX / 2), Math.ceil(database.boardSizeY / 2)]
		]

		if (database.currentModifier == "threeFruits") {
			game.apples = [
				[Math.ceil(database.boardSizeX / 2), Math.ceil(database.boardSizeY / 2)],
				[Math.ceil(database.boardSizeX / 2) - 2, Math.ceil(database.boardSizeY / 2) - 2],
				[Math.ceil(database.boardSizeX / 2) + 2, Math.ceil(database.boardSizeY / 2) + 2]
			]
		}

		game.walls = [

		]
		game.score = 0

		game.gameOver = false
		game.gameReset = false
		game.gameWon = false
		game.gameStart = false

		game.moves = 0

		return
	}

	for (let i = 0; i < game.snake.length; ++i) {
		if (!lastPosition) {
			lastPosition = [game.snake[i][0], game.snake[i][1], game.snake[i][2]]

			game.snake[i][0] += x
			game.snake[i][1] += y

			if (database.currentModifier == "borderless") {
				if (game.snake[i][0] < 0) {
					game.snake[i][0] = database.boardSizeX - 1
				} else if (game.snake[i][0] > (database.boardSizeX - 1)) {
					game.snake[i][0] = 0
				} else if (game.snake[i][1] < 0) {
					game.snake[i][1] = database.boardSizeY - 1
				} else if (game.snake[i][1] > (database.boardSizeY - 1)) {
					game.snake[i][1] = 0
				}
			} else {
				if (
					(game.snake[i][0] < 0) ||
					(game.snake[i][0] > (database.boardSizeX - 1)) ||
					(game.snake[i][1] < 0) ||
					(game.snake[i][1] > (database.boardSizeY - 1))
				) {
					game.gameOver = true

					game.snake[i][0] = lastPosition[0]
					game.snake[i][1] = lastPosition[1]
					game.snake[i][2] = lastPosition[2]

					break
				}
			}

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

			if (database.currentModifier == "walls") {
				let correctSpot = false

				let wall = [0, 0]

				let attempts = 0

				while (!correctSpot) {
					wall[0] = (Math.floor((Math.random() * (database.boardSizeX - 1))) * 2) + 1
					wall[1] = (Math.floor((Math.random() * (database.boardSizeY - 1))) * 2) + 1

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

					++attempts

					if (attempts > 50) {
						break
					}
				}

				game.walls.push(wall)
			}

			let correctSpot = false

			while (!correctSpot) {
				game.apples[j][0] = Math.floor(Math.random() * database.boardSizeX)
				game.apples[j][1] = Math.floor(Math.random() * database.boardSizeY)

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

	if ((game.score >= game.bestScore) && (game.moves >= game.bestMoves)) {
		game.bestScore = game.score
		game.bestMoves = game.moves
	}

	for (let j = 0; j < game.walls.length; ++j) {
		if (
			(game.walls[j][0] == game.snake[0][0]) &&
			(game.walls[j][1] == game.snake[0][1])
		) {
			game.gameOver = true

			return
		}
	}

	for (let j = 1; j < game.snake.length; ++j) {
		if (
			(game.snake[j][0] == game.snake[0][0]) &&
			(game.snake[j][1] == game.snake[0][1]) &&
			(game.snake[j][2] == 0)
		) {
			game.gameOver = true

			return
		}
	}

	if (
		((database.currentModifier == "walls") && (game.snake.length > ((config.defaultBoardSizeX * config.defaultBoardSizeY) * 0.77777778) - 3)) ||
		((game.snake.length > (database.boardSizeX * database.boardSizeY) - 3))
	) game.gameWon = true
}

database.checkForGuildEntry = function (id, name, memberCount) {
	if (!database.guilds[id]) {
		database.guilds[id] = {
			name,
			memberCount,
			game: {
				lastInteractee: 0,
				score: 0,
				bestScore: 0,
				moves: 0,
				bestMoves: 0,
				gameOver: true,
				gameStart: true,
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

// This formats the message sent with interactions.
database.formatMessage = function (game) {
	// WALLED: 196, OTHER: 252
	if (game.gameStart) {
		return `\`\`\`\n${renderText(game, database)}\n\`\`\`
# SNAKE
## Click any button to start!`
	} else if (game.gameWon) {
		return `\`\`\`\n${renderText(game, database)}\n\`\`\`
# YOU WIN! :D
## Final score: ${game.score}. Click any button below to reset.`
	} else if (game.gameReset) {
		game.gameOver = true

		return `\`\`\`\n${renderText(game, database)}\n\`\`\`
# GAME END!
## You've run out of time. Leaderboard and modifiers have been reset.
## Final score: ${game.score}. Click any button below to reset.`
	} else if (game.gameOver) {
		return `\`\`\`\n${renderText(game, database)}\n\`\`\`
# GAME OVER! :(
## Final score: ${game.score}. Click any button below to reset.`
	} else {
		return `\`\`\`\n${renderText(game, database)}\n\`\`\`
## Score: ${game.score}. Modifier: ${database.currentModifier}. Click the buttons to play!`
	}
}

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

		// Don't let people make more than one turn in a row
		if (game.lastInteractee == interaction.user.id && config.playersShouldTakeTurns) {
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

		let row = null

		if (game.gameOver) {
			// Yes, the restart button just sends an UP input. I'm lazy.
			const up = new ButtonBuilder()
				.setCustomId('up')
				.setLabel('Restart')
				.setStyle(ButtonStyle.Danger);

			row = new ActionRowBuilder()
				.addComponents(up);
		} else {
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

			row = new ActionRowBuilder()
				.addComponents(up, down, left, right);
		}

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

// Checks the date and updates things when needed
function checkDate() {
	const now = new Date();

	// If it is the next day, reset it all!
	if (now.getUTCDate() != database.currentDay) {
		database.currentDay = now.getUTCDate()

		database.currentModifier = config.allowedModifiers[Math.floor(Math.random() * config.allowedModifiers.length)]

		database.currentFruit = config.fruitTypes[Math.floor(Math.random() * config.fruitTypes.length)]

		for (let i = 0; i < Object.keys(database.guilds).length; ++i) {
			database.guilds[Object.keys(database.guilds)[i]].game.gameReset = true
			database.guilds[Object.keys(database.guilds)[i]].game.bestMoves = 0
			database.guilds[Object.keys(database.guilds)[i]].game.bestScore = 0
		}

		if (database.currentModifier == "largeBoard") {
			database.boardSizeX = config.largeBoardSizeX
			database.boardSizeY = config.largeBoardSizeY
		} else if (database.currentModifier == "smallBoard") {
			database.boardSizeX = config.smallBoardSizeX
			database.boardSizeY = config.smallBoardSizeY
		} else {
			database.boardSizeX = config.defaultBoardSizeX
			database.boardSizeY = config.defaultBoardSizeY
		}
	}

	let keys = Object.keys(database.guilds)
	let values = Object.values(database.guilds)
	database.leaderboard = []

	// Add all the items to an array in a, frankly, weird way
	for (let i = 0; i < keys.length; ++i) {
		database.leaderboard.push([keys[i], values[i]])
	}

	// Sort each guild based on the highest score. If two scores match, they are sorted by moves.
	database.leaderboard = database.leaderboard.sort((a, b) => {
		if (a[1].game.bestScore == b[1].game.bestScore) {
			return a[1].game.bestMoves - b[1].game.bestMoves
		} else return b[1].game.bestScore - a[1].game.bestScore
	})
}

// Run every 60 seconds, so it isn't running unneccesarially fast
setInterval(checkDate, 30e3)

// Also run now
checkDate()

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(config.token);
