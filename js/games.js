let TicTacToe = require('./games/Tic_Tac_Toe');
var bcrypt = require('bcrypt');

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


module.exports.init = function (app, authorize, doesRoomExist, getRoom, removeRoom) {


    function redirectToTheGame(room, req, res) {
        res.redirect('/rooms')
    }

    function isUserConnected(user, room) {
        for (let people of room) {
            if (people.nick == user.nick && people.mode == user.mode)
                return true;
        }
        return false;
    }

    app.get('/room/:guid', authorize, (req, res) => {

        let guid = req.params.guid;

        if (!doesRoomExist(guid)) {
            res.end("Aloha "+guid);
            return ;
        }

        let user = req.user;

        let room = getRoom(guid);

        isUserConnected(user,room.roomData.connectedPlayers)
        if (!isUserConnected(user,room.roomData.connectedPlayers)) {
            //Dołączył nowy użytkownik

            if (room.roomData.passwordRequired) {
                //Wymagane jest hasło dlatego generujemy stronę z formularzem
                res.render('login/roomPass.ejs', { error: "" })
            } else {
                //Hasło jest nie wymagane dlatego od razu udostępniamy grę.
                room.roomData.connectedPlayers.push(user);
                redirectToTheGame(room, req, res);
            }
        } else {
            //Użytkownik z dostępem 
            redirectToTheGame(room, req, res);
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
                        redirectToTheGame(room, req, res);
                    } else {
                        res.render('login/roomPass.ejs', { error: error })
                    }
                })();
            } else {
                //Hasło jest nie wymagane dlatego od razu udostępniamy grę.
                room.roomData.connectedPlayers.push(user);
                redirectToTheGame(room, req, res);
            }
        } else {
            //Użytkownik z dostępem 
            redirectToTheGame(room, req, res);
        }
    })

}