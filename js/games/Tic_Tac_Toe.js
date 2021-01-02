var bcrypt = require('bcrypt');

module.exports.run = async function (identifier, room, user, req, res) {
    res.render('games/TicTacToe/index.ejs', {
        guid: room.guid,
        user: JSON.stringify(user),
        identifierRaw: identifier.raw,
        identifierEncrypted: identifier.encrypted
    });
}

// let y = {
//     firstTurnBy: "userData",
//     turnNowBy: "userData",
//     users: { x: {nick,mode}, o: {nick,mode} },
//     history: "Wszystkie pozycje"
// }
module.exports.socketDo = function (socket, io, room, user) {

    socket.on('userMove', arg => {
        console.log(`Ruch użytkownika ${JSON.stringify(user)} na pozycji: ${arg.y} ${arg.x}`);
        if (typeof room.gameData !== 'undefined') {
            if (areUSersIdentical(room.gameData.users[room.gameData.turnNowBy], user)) {
                console.log('Użytkownicy są identyczni')
                if (canMakeMoveAt(room.gameData.history[0], arg.y, arg.x)) {
                    console.log('MOżna wykonać ruch')
                    room.gameData.history.unshift(newStateOfBoard(room.gameData.history[0], arg.y, arg.x, room.gameData.turnNowBy));
                    //Tutaj należy sprawdzić czy gra została już zakończona TODO

                    if (didSomeoneWon(room.gameData.history[0])) {
                        io.to(room.guid).emit('won', user.nick);
                    } else if (isEndOfGame(room.gameData.history[0])) {
                        io.to(room.guid).emit('end', '');
                    } else {
                        room.gameData.turnNowBy = nextTurn(room.gameData.turnNowBy);
                        io.to(room.guid).emit('move', room.gameData);
                    }
                }
            }
        }
    })
}

function nextTurn(symbol) {
    if (symbol == 'x')
        return 'o';
    else
        return 'x';
}

module.exports.socketOnConnect = function (socket, io, room, user) {
    if (typeof room.gameData === 'undefined') {
        room.gameData = {
            history: [
                [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ]
            ],
            users: {}
        };
    }

    if (typeof room.gameData.users.x === 'undefined') {
        room.gameData.users.x = user
    } else if (typeof room.gameData.users.o === 'undefined'
        && !areUSersIdentical(user, room.gameData.users.x)) {
        room.gameData.users.o = user

        //Skoro w tym przypadku mamy już wszystkich to czas na rozpoczęcie gry
        room.gameData.firstTurnBy = ['o', 'x'][Math.floor(Math.random() * 2)];
        room.gameData.turnNowBy = room.gameData.firstTurnBy;

        io.to(room.guid).emit('start', room.gameData);
    }
}

module.exports.socketOnDisconnect = function (socket, io, room) {

}

function areUSersIdentical(user1, user2) {
    return user1.nick === user2.nick && user1.mode === user2.mode;
}


function canMakeMoveAt(board, y, x) {
    return board[y][x] == null;
}

function newStateOfBoard(lastState, Y, X, symbol) {
    let clearBoard = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (lastState[y][x] != null)
                clearBoard[y][x] = lastState[y][x];
        }
    }
    clearBoard[Y][X] = symbol;
    return clearBoard;
}


function isEndOfGame(board) {
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (board[y][x] == null)
                return false;
        }
    }
    return true;
}

function didSomeoneWon(board) {
    // g g g
    for (let y = 0; y < 3; y++) {
        if (board[y][0] == board[y][1] && board[y][1] == board[y][2] && board[y][0] != null)
            return true;
    }
    //g
    //g
    //g
    for (let x = 0; x < 3; x++) {
        if (board[0][x] == board[1][x] && board[1][x] == board[2][x] && board[0][x] != null)
            return true;
    }
    //po przekątnej
    if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[2][2] != null)
        return true;
    if (board[0][2] == board[1][1] && board[1][1] == board[2][0] && board[2][0] != null)
        return true;

    return false;
}