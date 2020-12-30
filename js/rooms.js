const { Guid } = require('js-guid');


let rooms = new Map();
rooms.set("Aloha1",
    {
        name: "Aloha1", //Room name
        type: "Kółko i krzyżyk",//Game name
        presentUsers: 0,
        maxUsers: 4,
        link: "#",
        passwordRequired: true,
        password: "asd",
        canJoin: true,
        gameData: undefined,
    })

function getFreeGuid(){
    return Guid.newGuid().toString();
}


//Otrzymujemy tablicę w formie możliwej to przekazania widokowi
function getAvailableRooms_printVersion() {
    return Array.from(rooms.values()).map(obj => {
        return {
            name: obj.name,
            type: obj.type,
            presentUsers: obj.presentUsers,
            maxUsers: obj.maxUsers,
            link: obj.link,
            passwordRequired: obj.passwordRequired,
            canJoin: obj.canJoin
        }
    });
}

function doesRoomExist(name) {
    rooms.has(name);
}

function getRoomsNames() {
    return Array.from(rooms.keys());
}


module.exports = function (app, authorize, registered) {

    let games = require('./games');

    function createNewRoom(roomName, gameName, roomPassword) {

        rooms.set(roomName, {
            name: roomName,
            type: gameName,
            presentUsers: 0,
            maxUsers: games.basicGameData(gameName).maxPlayers,
            link: "/rooms/"+getFreeGuid(),
            passwordRequired: roomPassword != "",
            password: roomPassword,
            canJoin: true,
            gameData: undefined,
        })
    }

    /**
    * Wyświetlenie pokoi (GET)
    */
    function rooms_get(req, res, next) {
        res.render('./rooms/index.ejs', {
            nick: req.user.nick,
            registered: registered(req.user),
            rooms: getAvailableRooms_printVersion(),
            gamesType: games.gamesName(),
            newRoomError: ""
        })
    }

    /**
    * Dodanie pokoju (POST)
    */
    function rooms_post(req, res, next) {

        let roomName = req.body.name;
        let gameName = req.body.type;
        let roomPassword = req.body.password;

        //Weryfikacja poprawności pól
        let error = "";
        if (!gameName || !roomName) {
            error = "Tylko hasło może pozostać puste."
        }
        else if (doesRoomExist(roomName)) {
            error = "Pokój o takiej nazwie już istnieje (możliwe że jest już w trakcie gry).";
        }
        else if (!games.gamesName().includes(gameName)) {
            error = "Niepoprawny wybór gry.";
        }
        else if (getRoomsNames().includes(roomName)) {
            error = "Pokój o takiej nazwie już istnieje (może być niedostępny z powodu trwającej rozgrywki).";
        }

        if (error != "") {
            res.render('./rooms/index.ejs', {
                nick: req.user.nick,
                registered: registered(req.user),
                rooms: getAvailableRooms_printVersion(),
                gamesType: games.gamesName(),
                newRoomError: error
            })
        } else {
            //Stworzenie pokoju
            createNewRoom(roomName, gameName, roomPassword);

            //res.end("Todo");//Przekierowanie do nowo utworzonego pokoju
            res.redirect(req.url)
        }

    }


    app.get('/rooms', authorize, rooms_get);
    app.post('/rooms', authorize, rooms_post);
}