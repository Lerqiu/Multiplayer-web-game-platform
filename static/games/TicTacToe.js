'use strict'

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

function setUsersName(users) {
    if (users.x)
        document.getElementById('playerOne').innerHTML = `X: ${users.x.nick}`;
    if (users.o)
        document.getElementById('playerTwo').innerHTML = `O: ${users.o.nick}`;
}


function onStart(gameData) {
    setUsersName(gameData.users)
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
    console.log("dopaliło się")
    socket.on('start', arg => {
        onStart(arg);
        console.log(`Otrzymano sygnał startu: ${JSON.stringify(arg)}`)
    })

    socket.on('move', arg => {
        console.log(`Otrzymano informacje o nowym ruchu: ${JSON.stringify(arg)}`);
        synchronizeBoard(arg);
    })

    socket.on('end', arg => {
        alert('Gra została zakończona remisem.');
        window.location.href = window.location.hostname;
    })
    socket.on('won', arg => {
        alert(`Grę wygrał(a): ${arg} `);
        window.location.href = window.location.hostname;
    })
    socket.on('userUpdate', arg => {
        setUsersName(arg)
    })
    addEventListenersForBoard(socket);
}
