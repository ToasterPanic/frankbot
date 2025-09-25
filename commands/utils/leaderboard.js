const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View the leaderboard'),
	async execute(interaction, database) {

        // All of this is bad. All of it. It desperately needs to be redone. Like DESPERATELY.
        // I'll do it once I clean some stuff up + implement all the modifiers I want to.

        let items = database.leaderboard

        let place = 0

        // Count places to our guild in the leaderboard. WILDLY INEFFICIENT AND HORRIBLY AWFUL
        for (let i = 0; i < items.length; ++i) {
            if (items[i][0] == interaction.guild.id) {
                place = i + 1

                break
            }
        }

        // Get the ending bit (1st, 2nd, 3rd, 4th instead of 1st, 2st, 3st, 4st)
        let endingBit = "th"

        if ((place % 10) == 1) endingBit = "st"
        else if ((place % 10) == 2) endingBit = "nd"
        else if ((place % 10) == 3) endingBit = "rd"

        // Yes this looks ugly. I do not care in the slightest at the moment.
        let result = `# Leaderboard <:skoliosis:1420223788213338184>

## You are in **${place}${endingBit}!**

`
        
        for (let i = 0; i < 10; ++i) {
            if (!items[i]) {
                break
            }

            result += `${i + 1}. **${items[0][1].name}** at ${items[0][1].game.bestScore} points in ${items[0][1].game.bestMoves} moves.`
        }

		await interaction.reply(result);
	},
};
