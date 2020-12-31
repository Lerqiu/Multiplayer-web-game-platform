const { Guid } = require('js-guid');
var bcrypt = require('bcrypt');

let rooms = new Map();
// rooms.set(guid,
//     {
//         roomData: {
//             name: "Nazwa pokoju",
//             gameName: "Nazwa gry",
//             presentPlayers: "Obecni użytkownicy",
//             maxPlayers: "Pojemność pokoju",
//             link: "Link do pokoju", // /room/<guid>
//             passwordRequired: true, // or false
//             password: "zaszyfrowane hasło",
//             connectedPlayers : []
//             get canJoin() { return this.presentPlayers < this.maxPlayers },
//         },
//         guid: "wygenerowany guid",
//         gameData: undefined // W budowie
//     });


//Otrzymujemy tablicę pokoi do których można dołączyć
function getAvailableRoomsData() {
    return Array.from(rooms.values()).filter(room => {
        return room.roomData.canJoin;
    }).map(obj => {
        return obj.roomData;
    })
}


//Gettery i settery dla pokoi
function getRoomGuid_FromRoomName(roomName) {
    for (let room of rooms.values()) {
        if (room.roomData.name == roomName)
            return room.guid;
    }
    return undefined;
}

function doesRoomWithNameExist(roomName) {
    return getRoomGuid_FromRoomName(roomName) !== undefined;
}

function doesRoomExist(guid) {
    return rooms.has(guid);
}

function removeRoom(guid) {
    rooms.delete(guid);
}

function getRoom(guid) {
    return rooms.get(guid)
}


function getFreeGuid() {
    let guid;
    do {
        guid = Guid.newGuid().toString();
    } while (doesRoomExist(guid));
    return guid;
}

module.exports = function (app, authorize, registered,ioSocket) {

    let games = require('./games');
    games.init(app, authorize, doesRoomExist, getRoom, removeRoom,ioSocket)

    async function createNewRoom(roomName, gameName, roomPassword) {
        let guid = getFreeGuid();
        var rounds = 12;
        var encryptedPassword = await bcrypt.hash(roomPassword, rounds);

        let newRoom = {
            roomData: {
                name: roomName,
                gameName: gameName,

                maxPlayers: games.basicGameData(gameName).maxPlayers,
                link: "/room/" + guid,
                password: encryptedPassword,
                passwordRequired: roomPassword != "", // or false
                get canJoin() { return this.presentPlayers < this.maxPlayers },
                connectedPlayers: [],
                get presentPlayers() { return this.connectedPlayers.length },
            },
            guid: guid,
        };
        rooms.set(guid, newRoom);
        return newRoom;
    }

    /**
    * Wyświetlenie pokoi (GET)
    */
    function rooms_get(req, res, next) {
        res.render('./rooms/index.ejs', {
            nick: req.user.nick,
            registered: registered(req.user),
            rooms: getAvailableRoomsData(),
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
        } else if (doesRoomWithNameExist(roomName)) {
            error = "Pokój o takiej nazwie już istnieje (możliwe że jest już w trakcie gry).";
        } else if (!games.gamesName().includes(gameName)) {
            error = "Niepoprawny wybór gry.";
        }

        if (error != "") {
            res.render('./rooms/index.ejs', {
                nick: req.user.nick,
                registered: registered(req.user),
                rooms: getAvailableRoomsData(),
                gamesType: games.gamesName(),
                newRoomError: error
            })
        } else {
            //Stworzenie pokoju
            createNewRoom(roomName, gameName, roomPassword).then(result => {
                //res.end("Todo");//Przekierowanie do nowo utworzonego pokoju
                res.redirect(req.url)
            })
        }
    }

    //Inicjalizacja pokoi
    app.get('/rooms', authorize, rooms_get);
    app.post('/rooms', authorize, rooms_post);
}