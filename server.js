var http = require('http');
// var socket = require('socket.io');
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

// var io = socket(server);

let login = require("./js/login");
login.addLogin(app);


// io.on('connection', function (socket) {
//     console.log('client connected:' + socket.id);
//     socket.on('chat message', function (data) {
//         io.emit('chat message', data); // do wszystkich
//         //socket.emit('chat message', data); tylko do połączonego
//     })
// });

// setInterval(function () {
//     var date = new Date().toString();
//     io.emit('message', date.toString());
// }, 1000);
