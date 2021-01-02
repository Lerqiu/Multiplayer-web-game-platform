// 'use strict';

// let players = {
//   now: "1",
//   "0": "Anonymous",
//   "1": "Anonymous",
// }

// const symbolForPlayers = {
//   "0": "orange",
//   "1": "blue",
// }

// const descriptionOfSymbol = {
//   "0": "O",
//   "1": "X",
// }

// let board = {};
// const cellsAmount = 9;
// let isEndOfGame = false;

// function reloadTurnSpan() {
//   document.getElementById("turnTag").innerHTML =
//     ": " + players[players.now] +
//     " | " + descriptionOfSymbol[players.now];
// }

// function getCellId(cellNumber) {
//   return "square_" + String(cellNumber);
// }

// function getPlayersNames() {
//   for (let i = 0; i < 2; i++) {
//     players[i] = prompt(
//       `Name for player (starts with ${descriptionOfSymbol[i]}): `,
//       "Anonymous"
//     );
//   }
// }

// function decideWhoShouldStart() {
//   players.now = confirm(`Should start ${players[0]}?`) ?
//     players.now = '0' : players.now = '1'
// }

// function clearBoard() {
//   for (let i = 1; i <= cellsAmount; i++) {
//     board[i] = null;
//     document.getElementById(getCellId(i)).style.backgroundImage = null;
//   }
// }

// function addEventListenersForBoard() {
//   for (let i = 1; i <= cellsAmount; i++) {
//     document.getElementById(getCellId(i)).addEventListener("click", function () {
//       if (!isEndOfGame)
//         onClickListener(i);
//     });
//   }
// }

// function prepareGame() {
//   getPlayersNames();
//   decideWhoShouldStart();
//   reloadTurnSpan();
//   clearBoard();
// }


// function changePlayerTurn() {
//   if (players.now == "1") {
//     players.now = "0";
//   } else {
//     players.now = "1";
//   }
// }

// function addNewSymbolInBoard(cellNumber) {
//   document.getElementById(getCellId(cellNumber)).style.backgroundColor =
//    symbolForPlayers[players.now];
//   board[cellNumber] = players.now;
// }

// function checkIfCanAddSymbolAtCell(cellNumber) {
//   return board[cellNumber] == null;
// }

// function showEnd(player) {
//   if (player == null || undefined) {
//     alert("Is a draw!!!");
//   } else {
//     alert(`This time won: ${players[player]} | ${descriptionOfSymbol[player]}`);
//   }
// }

// function isThereAWinnerInRow(numerOfRow) {
//   return (board[(numerOfRow - 1) * 3 + 1] != null &&
//     board[(numerOfRow - 1) * 3 + 1] ===
//     board[(numerOfRow - 1) * 3 + 2] &&
//     board[(numerOfRow - 1) * 3 + 2] ===
//     board[(numerOfRow - 1) * 3 + 3]);
// }

// function isThereAWinnerInColumn(numerOfColumn) {
//   return (
//     board[numerOfColumn] != null &&
//     board[numerOfColumn] ===
//     board[numerOfColumn + 3] &&
//     board[numerOfColumn + 3] ===
//     board[numerOfColumn + 6]
//   );
// }

// function isThereAWinnerAcross() {
//   return (
//     board[5] != null &&
//     (
//       (board[1] === board[5] && board[5] === board[9]) ||
//       (board[3] === board[5] && board[5] === board[7])
//     )
//   )
// }

// function didSomeoneWon() {
//   if (isThereAWinnerAcross())
//     return board[5];

//   for (let i = 1; i <= 3; i++)
//     if (isThereAWinnerInColumn(i))
//       return board[i];

//   for (let i = 1; i <= 3; i++)
//     if (isThereAWinnerInRow(i))
//       return board[i + (i - 1) * 3];

//   return null;
// }

// function canNextMoveBeMade() {
//   for (let i = 1; i <= cellsAmount; i++)
//     if (board[i] == null)
//       return true;
//   return false;
// }

// function onClickListener(cellNumber) {
//   if (checkIfCanAddSymbolAtCell(cellNumber)) {
//     addNewSymbolInBoard(cellNumber);

//     let isThereAWinner = didSomeoneWon()
//     if (isThereAWinner != null) {
//       showEnd(isThereAWinner);
//       prepareGame();
//     } else if (canNextMoveBeMade()) {
//       changePlayerTurn()
//       reloadTurnSpan()
//     } else {
//       showEnd(null)
//     }
//   }
// }

// addEventListenersForBoard()
// prepareGame();


// 'use strict';

// let players = {
//     now: "1",
//     "0": "Anonymous",
//     "1": "Anonymous",
// }

// const symbolForPlayers = {
//     "0": "orange",
//     "1": "blue",
// }

// const descriptionOfSymbol = {
//     "0": "O",
//     "1": "X",
// }

// let board = {};
// const cellsAmount = 9;
// let isEndOfGame = false;

// function reloadTurnSpan() {
//     document.getElementById("playerOne").innerHTML =
//         ": " + players[players.now] +
//         " | " + descriptionOfSymbol[players.now];
// }

// function getCellId(cellNumber) {
//     return "square_" + String(cellNumber);
// }

// function getPlayersNames() {
//     for (let i = 0; i < 2; i++) {
//         players[i] ="Anonymous"
//     }
// }

// function decideWhoShouldStart() {
//     players.now = "0";
// }

// function clearBoard() {
//     for (let i = 1; i <= cellsAmount; i++) {
//         board[i] = null;
//         document.getElementById(getCellId(i)).style.backgroundImage = null;
//     }
// }

// function addEventListenersForBoard(socket) {
//     for (let i = 1; i <= cellsAmount; i++) {
//         document.getElementById(getCellId(i)).addEventListener("click", function () {
//             if (!isEndOfGame)
//                 onClickListener(i, socket);
//         });
//     }
// }

// function prepareGame() {
//     getPlayersNames();
//     decideWhoShouldStart();
//     reloadTurnSpan();
//     clearBoard();
// }


// function changePlayerTurn() {
//     if (players.now == "1") {
//         players.now = "0";
//     } else {
//         players.now = "1";
//     }
// }

// function addNewSymbolInBoard(cellNumber) {
//     document.getElementById(getCellId(cellNumber)).style.backgroundColor =
//         symbolForPlayers[players.now];
//     board[cellNumber] = players.now;
// }

// function checkIfCanAddSymbolAtCell(cellNumber) {
//     return board[cellNumber] == null;
// }

// function showEnd(player) {
//     if (player == null || undefined) {
//         alert("Is a draw!!!");
//     } else {
//         alert(`This time won: ${players[player]} | ${descriptionOfSymbol[player]}`);
//     }
// }

// function isThereAWinnerInRow(numerOfRow) {
//     return (board[(numerOfRow - 1) * 3 + 1] != null &&
//         board[(numerOfRow - 1) * 3 + 1] ===
//         board[(numerOfRow - 1) * 3 + 2] &&
//         board[(numerOfRow - 1) * 3 + 2] ===
//         board[(numerOfRow - 1) * 3 + 3]);
// }

// function isThereAWinnerInColumn(numerOfColumn) {
//     return (
//         board[numerOfColumn] != null &&
//         board[numerOfColumn] ===
//         board[numerOfColumn + 3] &&
//         board[numerOfColumn + 3] ===
//         board[numerOfColumn + 6]
//     );
// }

// function isThereAWinnerAcross() {
//     return (
//         board[5] != null &&
//         (
//             (board[1] === board[5] && board[5] === board[9]) ||
//             (board[3] === board[5] && board[5] === board[7])
//         )
//     )
// }

// function didSomeoneWon() {
//     if (isThereAWinnerAcross())
//         return board[5];

//     for (let i = 1; i <= 3; i++)
//         if (isThereAWinnerInColumn(i))
//             return board[i];

//     for (let i = 1; i <= 3; i++)
//         if (isThereAWinnerInRow(i))
//             return board[i + (i - 1) * 3];

//     return null;
// }

// function canNextMoveBeMade() {
//     for (let i = 1; i <= cellsAmount; i++)
//         if (board[i] == null)
//             return true;
//     return false;
// }


// //Należy wykorzystać socket.io do wysłania informacji do serwera o potencjalnym ruchu
// function onClickListener(cellNumber, socket) {
//     socket.emit('klocek', cellNumber);
//     // if (checkIfCanAddSymbolAtCell(cellNumber)) {
//     //     addNewSymbolInBoard(cellNumber);

//     //     let isThereAWinner = didSomeoneWon()
//     //     if (isThereAWinner != null) {
//     //         showEnd(isThereAWinner);
//     //         prepareGame();
//     //     } else if (canNextMoveBeMade()) {
//     //         changePlayerTurn()
//     //         reloadTurnSpan()
//     //     } else {
//     //         showEnd(null)
//     //     }
//     // }
// }

function getCellId(cellNumber) {
    return "square_" + String(cellNumber);
}

//Należy wykorzystać socket.io do wysłania informacji do serwera o potencjalnym ruchu
function onClickListener(cellNumber, socket) {
    console.log('Została kliknięta komórka')
    let [y, x] = [Math.floor((cellNumber - 1) / 3), (cellNumber - 1) % 3]
    socket.emit('userMove', { x, y });
}

function addEventListenersForBoard(socket) {
    for (let i = 1; i <= 9; i++) {
        document.getElementById(getCellId(i)).addEventListener("click", function () {
            onClickListener(i, socket);
        });
    }
}



function turnOf(symbol) {
    if (symbol == 'x') {
        document.getElementById('playerOne').style.backgroundColor = 'red';
        document.getElementById('playerTwo').style.backgroundColor = '';
    } else {
        document.getElementById('playerOne').style.backgroundColor = '';
        document.getElementById('playerTwo').style.backgroundColor = 'blue';
    }
}

function onStart(gameData) {
    document.getElementById('playerOne').innerHTML = `X: ${gameData.users.x.nick}`;
    document.getElementById('playerTwo').innerHTML = `O: ${gameData.users.o.nick}`;
    turnOf(gameData.turnNowBy);
    document.getElementById('status').remove();
}

function setCellAt(symbol, y, x) {
    let cellNumber = (y * 3) + x + 1;
    let color;
    switch (symbol) {
        case 'x':
            color = 'red';
            break;
        case 'o':
            color = 'blue';
            break;
        default:
            color = '';
    }
    document.getElementById(getCellId(cellNumber)).style.backgroundColor = color;
    console.log(`UStawiono kolor komórki ${cellNumber} na ${color}`);
}

function synchronizeBoard(gameData) {
    turnOf(gameData.turnNowBy);
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            setCellAt(gameData.history[0][y][x], y, x)
        }
    }
}

function startGame(socket) {
    socket.on('start', arg => {
        onStart(arg);
        console.log(`Otrzymano sygnał startu: ${JSON.stringify(arg)}`)
    })

    socket.on('move', arg => {
        console.log(`Otrzymano informacje o nowym ruchu: ${JSON.stringify(arg)}`);
        synchronizeBoard(arg);
    })

    socket.on('end', arg => {
        alert('Gra zostałą zakończona remisem.')
    })
    socket.on('won', arg => {
        alert(`Grę wygrał: ${arg} `)
    })
    addEventListenersForBoard(socket);
}