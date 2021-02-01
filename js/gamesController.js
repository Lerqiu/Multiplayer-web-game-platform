let http = require('http');
let Rooms = require('./Rooms');
let express = require('express');
let Users = require('./Users');
let gameIdentifier = require('./gameIdentifier');
let basicsGamesData = require('./basicsGamesData');
var bcrypt = require('bcrypt');
let UserCookie = require('./UserCookie');

/**
* Inicjalizacja strony z pokojami
* @param {express.Express} app Obiekt express
* @param {Rooms} rooms
* 
*/
module.exports.init = function (app, authorize, rooms, users) {


    function redirectToTheGame(room, user, req, res) {
        (async function () {
            var identifier = await gameIdentifier.makeIdentifier(room.id, user);

            basicsGamesData.getBasicData(room.getGameName()).runGame(identifier, room, user, req, res);
        })()
    }
    /**
     * Wyświetlenie pokoi (GET)
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @param {*} next
     */
    function games_get(req, res, next) {

        let id = req.params.id;

        if (!rooms.hasRoomById(id)) {
            return res.end("Error: wrong room");
        }

        let user =UserCookie.FromObject(req.user);

        let room = rooms.getRoom(id);

        if (room.isPasswordRequired()) {
            //Wymagane jest hasło dlatego generujemy stronę z formularzem
            res.render('login/roomPass.ejs', { error: "" })
        } else {
            //Hasło jest nie wymagane dlatego od razu udostępniamy grę.
            redirectToTheGame(room, user, req, res);
        }
    }

    /**
    * Wyświetlenie pokoi (POST)
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @param {*} next
    */
    function games_post(req, res, next) {

        let id = req.params.id;

        if (!rooms.hasRoomById(id)) {
            return res.end("Error: wrong room");
        }

        let user = UserCookie.FromObject(req.user);;

        let room = rooms.getRoom(id);

        //Użytkownik podał już hasło należy je sprawdzić
        let password = req.body.password;

        if (room.isPasswordRequired()) {
            (async function () {
                let error = "";
                if (!password) {
                    error = "Hasło nie może pozostać puste."
                } else {
                    var passwordInBase = room.getPassword();
                    let value = await bcrypt.compare(password, passwordInBase);
                    if (!value) {
                        error = "Hasło jest nieprawidłowe.";
                    }
                }
                if (error == "") {
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
    }

    (function () {
        app.get('/room/:id', authorize, games_get);
        app.post('/room/:id', authorize, games_post);
    })()

}
