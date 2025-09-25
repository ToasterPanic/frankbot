const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View the leaderboard'),
	async execute(interaction, database) {

        // All of this is bad. All of it. It desperately needs to be redone. Like DESPERATELY.
        // I'll do it once I clean some stuff up + implement all the modifiers I want to.

        let keys = Object.keys(database.guilds)
        let values = Object.values(database.guilds)
        let items = []
        
        // Add all the items to an array in a, frankly, weird way
        for (let i = 0; i < keys.length; ++i) {
            items.push([keys[i], values[i]])
        }

        // Sort each guild based on the highest score. If two scores match, they are sorted by moves.
        items = items.sort((a, b) => {
            if (a[1].game.bestScore == b[1].game.bestScore) {
                return b[1].game.bestMoves - a[1].game.bestMoves
            } else return a[1].game.bestScore - b[1].game.bestScore
        })

        let place = 0

        // Count places to our guild in the leaderboard. WILDLY INEFFICIENT AND HORRIBLY AWFUL
        for (let i = 0; i < items.length; ++i) {
            if (items[i][0] == interaction.guild.id) {
                place = i + 1

                break
            }
        }

        // Yes this looks ugly. I do not care in the slightest at the moment.
        let result = `# Leaderboard <:skoliosis:1420223788213338184>

## You are in **${place}st!**

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
