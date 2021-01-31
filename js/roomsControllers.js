let http = require('http');
let Rooms = require('./Rooms')
let express = require('express');
let Users = require('./Users')
var socket = require('socket.io');
let basicsGamesData = require('./basicsGamesData');

/**
* Inicjalizacja strony z pokojami
* @param {express.Express} app Obiekt express
* @param {Users} users Moduł users
* @param {Rooms} rooms
* @param {socket.Socket} ioSocket
* 
*/
module.exports.init = function (app, authorize, rooms) {
    /**
     * Wyświetlenie pokoi (GET)
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @param {*} next
     */
    function rooms_get(req, res, next) {
        res.render('./rooms/index.ejs', {
            nick: req.user.getNick(),
            registered: req.user.isRegistered(),
            rooms: rooms.getAvailableRooms(),
            gamesType: basicsGamesData.gamesName(),
            newRoomError: "",
	    won: req.user.getWon(),
	    lost: req.user.getLost(),
	    remis: req.user.getRemis()
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
        } else if (rooms.hasRoomByName(roomName)) {
            error = "Pokój o takiej nazwie już istnieje (możliwe że jest już w trakcie gry).";
        } else if (!basicsGamesData.gamesName().includes(gameName)) {
            error = "Niepoprawny wybór gry.";
        }

        if (error != "") {
            res.render('./rooms/index.ejs', {
                nick: req.user.getNick(),
                registered: req.user.isRegistered(),
                rooms: rooms.getAvailableRooms(),
                gamesType: basicsGamesData.gamesName(),
                newRoomError: error,
		won: req.user.getWon(),
		lost: req.user.getLost(),
	    	remis: req.user.getRemis()
            })
        } else {
            //Stworzenie pokoju
            rooms.addRoom(roomName, gameName, roomPassword).then(result => {
                //res.end("Todo");//Przekierowanie do nowo utworzonego pokoju
                res.redirect(req.url)
            })
        }
    }

    //Inicjalizacja pokoi
    (function () {
        app.get('/rooms', authorize, rooms_get);
        app.post('/rooms', authorize, rooms_post);
    })();
}
