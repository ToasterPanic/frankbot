const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View the leaderboard'),
	async execute(interaction, database) {
        let keys = Object.keys(database.guilds)
        let values = Object.values(database.guilds)
        let items = []
        
        for (let i = 0; i < keys.length; ++i) {
            items.push([keys[i], values[i]])
        }

        items = items.sort((a, b) => a[1].game.score - a[2].game.score)

        let place = 0

        for (let i = 0; i < items.length; ++i) {
            if (items[i][0] == interaction.guild.id) {
                place = i + 1

                break
            }
        }

        let result = `# Leaderboard <:skoliosis:1420223788213338184>

## You are in **${place}st!**

`
        
        for (let i = 0; i < 10; ++i) {
            if (!items[i]) {
                break
            }

            result += `${i + 1}. **${items[0][1].name}** at ${items[0][1].game.score} points\n`
        }

		await interaction.reply(result);
	},
};
