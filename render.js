const {
    emptyTileCharacter,
    snakeTileCharacter,
    snakeHeadTileCharacter,
    cheeseholeTileCharacter,
    cheeseholeHeadTileCharacter,
    appleTileCharacter,
    wallTileCharacter
} = require('./config.json');

module.exports = {
    renderText: function (game) {
        // Create the board
        let result = `.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................`

        for (let i = 0; i < game.walls.length; ++i) {
            let position = game.walls[i]
            if (!position) continue;

            let character = (position[1] * 17) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1) + "W"
            let sectionB = result.slice(character)

            result = sectionA + sectionB

        }

        for (let i = 0; i < game.apples.length; ++i) {
            let position = game.apples[i]
            if (!position) continue;

            let character = (position[1] * 17) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1) + "A"
            let sectionB = result.slice(character)

            result = sectionA + sectionB

        }

        for (let i = game.snake.length; i >= 0; --i) {
            let position = game.snake[i]
            if (!position) continue;

            let character = (position[1] * 17) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1)


            if (i == 0) {
                // If position[2] exists, that means it's a cheese hole.
                if (position[2]) {
                    sectionA += "c"
                } else {
                    sectionA += "s"
                }
            } else {
                if (position[2]) {
                    sectionA += "C"
                } else {
                    sectionA += "S"
                }
            }


            let sectionB = result.slice(character)

            result = sectionA + sectionB
        }

        // Since emojis can be several characters, we use placeholder letters and replace them with the emojis at the end.
        result = result
            .replaceAll("W", wallTileCharacter)
            .replaceAll("S", snakeTileCharacter)
            .replaceAll("C", cheeseholeTileCharacter)
            .replaceAll("s", snakeHeadTileCharacter)
            .replaceAll("c", cheeseholeHeadTileCharacter)
            .replaceAll("A", appleTileCharacter)
            .replaceAll(".", emptyTileCharacter)

        if (typeof result == "object") {
            console.log(JSON.stringify(result))
        }

        return result
    }
}