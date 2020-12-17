var http = require('http');
var socket = require('socket.io');
var express = require('express');

var app = express();

app.set("view engine", "ejs");
app.set("views", "views")
app.use(express.static('./static'));

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);

var io = socket(server);


app.get('/', (req, res) => {
    res.render("index.ejs");
});


io.on('connection', function (socket) {
    console.log('client connected:' + socket.id);
    socket.on('chat message', function (data) {
        io.emit('chat message', data); // do wszystkich
        //socket.emit('chat message', data); tylko do połączonego
    })
});

setInterval(function () {
    var date = new Date().toString();
    io.emit('message', date.toString());
}, 1000);
console.log('server listens');