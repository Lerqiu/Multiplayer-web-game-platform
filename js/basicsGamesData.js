let TicTacToe = require('./games/Tic_Tac_Toe')

let games = new Map();

//Podstawowe dane o grze. Czyli jak ją odpalić oraz ile może być maksymalnie graczy
games.set("Tic Tac Toe", {
    maxPlayers: 2,
    runGame: TicTacToe.run,
    socketDo: TicTacToe.socketDo,
    socketOnConnect: TicTacToe.socketOnConnect,
    socketOnDisconnect: TicTacToe.socketOnDisconnect
});



//Lista wszystkich dostępnych gier
module.exports.gamesName = function gameNames() {
    return Array.from(games.keys());
}

//Zwrócenie informacji o wybranej grze
module.exports.getBasicData = function (gameName) {
    if (!games.has(gameName)) {
        throw new Error(`Brak gry o nazwie: ${gameName}`);
    }
    return games.get(gameName);
}