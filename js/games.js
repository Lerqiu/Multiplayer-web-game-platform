let TicTacToe = require('./games/Tic_Tac_Toe');
var bcrypt = require('bcrypt');

let games = new Map();
games.set("Tic Tac Toe", { maxPlayers: 2, runGame: TicTacToe.run, 
    socketDo: TicTacToe.socketDo ,
    socketOnConnect:TicTacToe.socketOnConnect,
    socketOnDisconnect:TicTacToe.socketOnDisconnect});


module.exports.gamesName = function () {
    return Array.from(games.keys());
}

module.exports.basicGameData = function (gameName) {
    console.log(gameName)
    return { maxPlayers: games.get(gameName).maxPlayers }
}


module.exports.init = function (app, authorize, doesRoomExist, getRoom, removeRoom, io) {

    io.on('connection', socket => {
        let room;
        //socket.join('some room');
        socket.on('init', function (msg) {
            decodeIdentifier(msg.identifierRaw, msg.identifierEncrypted).then(message => {
                if (!message.status) {
                    console.log("Wiadomość błędna")
                    return;
                }
                if (doesRoomExist(message.guid)) {
                    room = getRoom(message.guid);
                    if (isUserConnected(message.user, room.roomData.connectedPlayers)) {
                        let connectedList = getUserConnected(message.user,room.roomData.connectedPlayers);
                        connectedList.socketIDs.push(socket.id);
                    } else {
                        let record = {
                            nick: message.user.nick,
                            mode: message.user.mode,
                            socketIDs: [socket.id]
                        }
                        room.roomData.connectedPlayers.push(record)
                    }
                    socket.join(room.guid);//Dołączenie socketu do pokoju 
                    games.get(room.roomData.gameName).socketOnConnect(socket, io, room,message.user);//Wydarzenia po połączeniu
                    games.get(room.roomData.gameName).socketDo(socket, io, room,message.user);//Obsługa eventów z socketu wybranej gry 
                } else {
                    console.log("Pokój nie istnieje")
                }
            })

        })

        socket.on('disconnecting', () => {
            console.log(`Czas to wszystko zakończyć ${typeof room !== 'undefined'} ${typeof room}`);
            if (typeof room === 'undefined' || !doesRoomExist(room.guid)) {
                return;
            }
            let connected = room.roomData.connectedPlayers;
            connected = connected.map(player => {
                return {
                    nick: player.nick,
                    mode: player.mode,
                    socketIDs: player.socketIDs.filter(id => {
                        return id != socket.id;
                    })
                };
            });
            connected = connected.filter(player => {
                return player.socketIDs.length > 0;
            })
            games.get(room.roomData.gameName).socketOnDisconnect(socket, io, room);
            if (connected.length == 0) {
                console.log("Pokój jest pusty " + JSON.stringify(room))
                removeRoom(room.guid);
            } else {
                console.log("Pokój nie jest pusty");
                room.roomData.connectedPlayers = connected;
            }
        })
    });

    async function makeIdentifier(guid, user) {
        var rounds = 12;
        var data = JSON.stringify({ guid: guid, user: user });

        var encryptedData = await bcrypt.hash(data, rounds);

        var identifier = { raw: data, encrypted: encryptedData };

        return identifier;
    }

    async function decodeIdentifier(identifierRaw, identifierEncrypted) {
        let status = await bcrypt.compare(identifierRaw, identifierEncrypted);
        data = JSON.parse(identifierRaw);

        return { status, user: data.user, guid: data.guid }
    }



    function redirectToTheGame(room, user, req, res) {
        (async function () {
            var identifier = await makeIdentifier(room.guid, user);

            games.get(room.roomData.gameName).runGame(identifier, room, user, req, res);
        })()
    }

    function isUserConnected(user, room) {
        for (let people of room) {
            if (people.nick == user.nick && people.mode == user.mode)
                return true;
        }
        return false;
    }

    function getUserConnected(user, room) {
        console.log("Room is not iterable???: " + JSON.stringify(room))
        for (let people of room) {
            if (people.nick == user.nick && people.mode == user.mode)
                return people;
        }
        return undefined;
    }

    app.get('/room/:guid', authorize, (req, res) => {

        let guid = req.params.guid;

        if (!doesRoomExist(guid)) {
            res.end("Aloha " + guid);
            return;
        }

        let user = req.user;

        let room = getRoom(guid);

        isUserConnected(user, room.roomData.connectedPlayers)
        if (!isUserConnected(user, room.roomData.connectedPlayers)) {
            //Dołączył nowy użytkownik

            if (room.roomData.passwordRequired) {
                //Wymagane jest hasło dlatego generujemy stronę z formularzem
                res.render('login/roomPass.ejs', { error: "" })
            } else {
                //Hasło jest nie wymagane dlatego od razu udostępniamy grę.
                // room.roomData.connectedPlayers.push(user);
                redirectToTheGame(room, user, req, res);
            }
        } else {
            //Użytkownik z dostępem 
            redirectToTheGame(room, user, req, res);
        }
    })

    app.post('/room/:guid', authorize, (req, res) => {

        let guid = req.params.guid;

        if (!doesRoomExist(guid)) {
            return res.end("Error: wrong room");
        }

        let user = req.user;

        let room = getRoom(guid);

        //Użytkownik podał już hasło należy je sprawdzić
        let password = req.body.password;

        if (!room.roomData.connectedPlayers.includes(user)) {
            //Dołączył nowy użytkownik

            if (room.roomData.passwordRequired) {
                (async function () {
                    let error = "";
                    if (!password) {
                        error = "Hasło nie może pozostać puste."
                    } else {
                        var passwordInBase = room.roomData.password;
                        let value = await bcrypt.compare(password, passwordInBase);
                        if (!value) {
                            error = "Hasło jest nieprawidłowe.";
                        }
                    }
                    if (error == "") {
                        room.roomData.connectedPlayers.push(user);
                        redirectToTheGame(room, user, req, res);
                    } else {
                        res.render('login/roomPass.ejs', { error: error })
                    }
                })();
            } else {
                //Hasło jest nie wymagane dlatego od razu udostępniamy grę.
                //room.roomData.connectedPlayers.push(user);
                redirectToTheGame(room, user, req, res);
            }
        } else {
            //Użytkownik z dostępem 
            redirectToTheGame(room, user, req, res);
        }
    })

}