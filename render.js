const { emptyTileCharacter, snakeTileCharacter, appleTileCharacter } = require('./config.json');

module.exports = {
    renderText: function (game) {
        // Create the board
        let result = `............
............
............
............
............
............
............
............
............
............
............
............`

        for (let i = 0; i < game.apples.length; ++i) {
            let position = game.apples[i]
            if (!position) continue;

            let character = (position[1] * 12) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1) + "A"
            let sectionB = result.slice(character)

            result = sectionA + sectionB

        }

        for (let i = 0; i < game.snake.length; ++i) {
            let position = game.snake[i]
            if (!position) continue;

            let character = (position[1] * 12) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1) + "S"
            let sectionB = result.slice(character)

            result = sectionA + sectionB
        }

        // Since emojis can be several characters, we use placeholder letters and replace them with the emojis at the end.
        result = result
            .replaceAll("S", snakeTileCharacter)
            .replaceAll("A", appleTileCharacter)
            .replaceAll(".", emptyTileCharacter)
            
        if (typeof result == "object") {
            console.log(JSON.stringify(result))
        }

        return result
    }
}