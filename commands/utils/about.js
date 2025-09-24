const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('About this bot'),
	async execute(interaction, database) {
		await interaction.reply(`# Skoliosis
*A bot made by ToasterPanic for [Converge](https://converge.hackclub.com/)*

- Use \`/play\` to start a game. Click the buttons below the message to move the snake.
- Players cannot make moves more than once in a row -- this is a team effort!
- Compete to win in the least moves - fight for first place on the leaderboard.
- 1st place gets your server (AND the user who made the final move) featured all over the bot!*
- Every day, the leaderboard resets, and a new twist to the Snake formula appears!

*\*Server owners may disable this. New servers (<1 year old) are not eligible by default - DM @ToasterPanic to get your server verified.*`);
	},
};
