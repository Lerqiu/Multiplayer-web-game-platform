var http = require('http');
var socket = require('socket.io');
var express = require('express');
var cookieParser = require('cookie-parser');

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

(async function () {

    let Users = require('./js/Users');
    let users = await Users.newAndConnect()

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