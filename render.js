const fs = require('node:fs');
const yaml = require('js-yaml');
const { data } = require('./commands/utils/play');

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'))

module.exports = {
    renderText: function (game, database) {
        // Create the board
        let result = ``

        let section = ""

        for (let i = 0; i < database.boardSizeX; ++i) {
            section += "."
        }

        result += section
        for (let i = 1; i < database.boardSizeY; ++i) {
            result += "\n" + section
        }

        for (let i = 0; i < game.walls.length; ++i) {
            let position = game.walls[i]
            if (!position) continue;

            let character = (position[1] * database.boardSizeX) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1) + "W"
            let sectionB = result.slice(character)

            result = sectionA + sectionB

        }

        for (let i = 0; i < game.apples.length; ++i) {
            let position = game.apples[i]
            if (!position) continue;

            let character = (position[1] * database.boardSizeX) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1) + "A"
            let sectionB = result.slice(character)

            result = sectionA + sectionB

        }

        for (let i = game.snake.length; i >= 0; --i) {
            let position = game.snake[i]
            if (!position) continue;

            let character = (position[1] * database.boardSizeX) + position[0] + position[1] + 1

            let sectionA = result.slice(0, character - 1)


            if (i == 0) {
                // If position[2] exists, that means it's a cheese hole.
                if (position[2]) {
                    sectionA += "c"
                } else if (game.gameOver && !game.gameWom) {
                    sectionA += "d"
                } else {
                    sectionA += "s"
                }
            } else {
                if (position[2]) {
                    sectionA += "C"
                } else if (game.gameOver && !game.gameWom) {
                    sectionA += "D"
                } else {
                    sectionA += "S"
                }
            }


            let sectionB = result.slice(character)

            result = sectionA + sectionB
        }

        // Since emojis can be several characters, we use placeholder letters and replace them with the emojis at the end.
        result = result
            .replaceAll("W", config.wallTileCharacter)
            .replaceAll("S", config.snakeTileCharacter)
            .replaceAll("C", config.cheeseholeTileCharacter)
            .replaceAll("D", config.deadSnakeTileCharacter)
            .replaceAll("s", config.snakeHeadTileCharacter)
            .replaceAll("c", config.cheeseholeHeadTileCharacter)
            .replaceAll("d", config.deadHeadTileCharacter)
            .replaceAll("A", database.currentFruit)
            .replaceAll(".", config.emptyTileCharacter)

        if (typeof result == "object") {
            console.log(JSON.stringify(result))
        }

        return result
    }
}