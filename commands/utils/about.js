const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('About this bot'),
	async execute(interaction, database) {

		await interaction.reply(`# Skoliosis <:skoliosis:1420223788213338184>
*A bot made by ToasterPanic for [Converge](https://converge.hackclub.com/)*

- Use \`/play\` to start a game. Click the arrow buttons to help Frank eat fruit! 🍎
- Players cannot make moves more than once in a row -- this is a team effort! 🤝
- Compete to get the highest score - fight for first place on the leaderboard. ⚔️
- 1st place gets your server (AND the user who made the final move) featured all over the bot! 🏆*
- Every day, the leaderboard resets, and a new twist to the Snake formula appears! <:7005snakewhite:1420223849747845200>

*\*Server owners will be able to disable this. New servers (<6 months old) must be verified manually.*`);

	},
};
