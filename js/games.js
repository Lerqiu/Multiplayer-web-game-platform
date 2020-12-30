let TicTacToe = require('./games/Tic_Tac_Toe');


let games = new Map();
games.set("Tic Tac Toe", { maxPlayers: 2, runGame: () => { TicTacToe.run() } });

module.exports.gamesName = function () {
    return Array.from(games.keys());
}

module.exports.basicGameData = function (gameName) {
    console.log(gameName)
    return { maxPlayers: games.get(gameName).maxPlayers }
}

module.exports.runGame = function (gameName) {
    return games.get(gameName).runGame();
}
