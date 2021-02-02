var bcrypt = require('bcrypt');
let UserCookie = require('./../UserCookie')
let Users = require('./../Users')


module.exports.run = async function (identifier, room, user, req, res) {
    res.render('games/TicTacToe/index.ejs', {
        identifier
    });
}

module.exports.socketOnConnect = function (socket, io, room, user, rooms) {
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
        io.to(room.id).emit('userUpdate', room.gameData.users);
    } else if (typeof room.gameData.users.o === 'undefined'
        && !user.isIdentical(room.gameData.users.x)) {
        room.gameData.users.o = user

        //Skoro w tym przypadku mamy już wszystkich to czas na rozpoczęcie gry
        room.gameData.firstTurnBy = ['o', 'x'][Math.floor(Math.random() * 2)];
        room.gameData.turnNowBy = room.gameData.firstTurnBy;

        io.to(room.id).emit('start', room.gameData);
    }
}


module.exports.socketDo = function (socket, io, room, user, rooms, users) {
    function changeStatOnEnemy(user, allPlayers, fun) {
        allPlayers.forEach(element => {
            if (user.getNick() != element.getNick()) {
                try {
                    console.log(JSON.stringify(element))
                    if (element.isRegistered()) {
                        fun(element.getNick())
                    }
                } catch (err) {
                    console.log(err)
                }
                return;
            }
        });
    }

    function changeStatOnYourself(user, fun) {
        try {
            if (user.isRegistered()) {
                fun(user.getNick())
            }
        } catch (err) {
            console.log(err)
        }
    }

    socket.on('userMove', arg => {
        if (typeof room.gameData !== 'undefined') {
            if (user.isIdentical(room.gameData.users[room.gameData.turnNowBy])) {
                if (canMakeMoveAt(room.gameData.history[0], arg.y, arg.x)) {
                    room.gameData.history.unshift(newStateOfBoard(room.gameData.history[0], arg.y, arg.x, room.gameData.turnNowBy));

                    if (didSomeoneWon(room.gameData.history[0])) {
                        changeStatOnYourself(user,  users.addW);
                        changeStatOnEnemy(user, room.getAllConnectedPlayers(), users.addL);
                        io.to(room.id).emit('won', user.getNick());
                        rooms.removeRoom(room.id);
                    } else if (isEndOfGame(room.gameData.history[0])) {
                        console.log(JSON.stringify(room.getAllConnectedPlayers()))
                        io.to(room.id).emit('end', '');
                        changeStatOnEnemy(user, room.getAllConnectedPlayers(), users.addR);
                        changeStatOnYourself(user, users.addR);
                        rooms.removeRoom(room.id);
                    } else {
                        room.gameData.turnNowBy = nextTurn(room.gameData.turnNowBy);
                        io.to(room.id).emit('move', room.gameData);
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



module.exports.socketOnDisconnect = function (socket, io, room) {

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
