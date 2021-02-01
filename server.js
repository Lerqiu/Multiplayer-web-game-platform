var http = require('http');
var socket = require('socket.io');
var express = require('express');
var cookieParser = require('cookie-parser');
var { Client } = require('pg');

var app = express();

app.set("view engine", "ejs");
app.set("views", "views")

app.disable("etag");

app.use(express.static('./static'));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('asgasfasdfqwafsafasdasfaw125t1qfawr123rfq'));

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);
console.log(`Server listens: ${process.env.PORT || 3000}`);

var io = socket(server);


//Ustawienie parametrów połączenia z bazą danych
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

//Rozłączenie z bazą danych podczas zakończenia działania programu
process.on('SIGHUP', function () {
    client.end();
});

//Łączenie z bazą danych
client.connect();

(async function () {
    //Pobranie danych z bazy
    let dataOfUsers = new Map();
    try {
        let result = await client.query('SELECT * FROM USERS;');
        result.rows.forEach(row => {
            dataOfUsers.set(row[0], { encryptedPassword: row[1], won =0, lost=0, remis=0, gamesStats: [] });
        })
    } catch (err) {
        console.log(err);
    }


    let Users = require('./js/Users');

    let users = new Users(client,dataOfUsers);

    let loginController = require("./js/loginController");
    let authorize = loginController(app, users);//Zainicjowanie możliwości logowania i prostej autoryzacji

    let Rooms = require('./js/Rooms');
    let rooms = new Rooms();

    let roomsControllers = require('./js/roomsControllers');
    roomsControllers.init(app, authorize, rooms, users); //Wystartowanie pokoi


    let gameController = require('./js/gamesController');
    gameController.init(app, authorize, rooms, users);

    let basicSocket = require('./js/gameSocketBasic');
    basicSocket.init(rooms, users, io);

})();