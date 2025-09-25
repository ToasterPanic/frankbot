const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamestate')
		.setDescription('Dev: get game state'),
	async execute(interaction, database) {
        let data = database.guilds[interaction.guild.id]
        let game = data.game

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
            content: "```" + JSON.stringify(game) + "```",
            components: [row]
        })
	},
};
