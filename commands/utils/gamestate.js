const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamestate')
		.setDescription('Dev: get game state'),
	async execute(interaction, database) {
        let data = database.guilds[interaction.guild.id]
        let game = data.game

        const button1 = new ButtonBuilder()
			.setCustomId('button1')
			.setLabel('me when when when when when when whenw h=jndksvml/zl')
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder()
			.addComponents(button1);

		await interaction.reply({
            content: "```" + JSON.stringify(game) + "```",
            components: [row]
        })
	},
};
