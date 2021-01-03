
let http = require('http');
let Rooms = require('./Rooms');
let express = require('express');
let Users = require('./Users');
let gameIdentifier = require('./gameIdentifier');
let basicsGamesData = require('./basicsGamesData');
var socket = require('socket.io');


/**
* Inicjalizacja strony z pokojami
* @param {express.Express} app Obiekt express
* @param {Users} users Moduł users
* @param {Rooms} rooms
* @param {socket.Socket} io
* 
*/
module.exports.init = function (rooms, users, io) {
    io.on('connection', socket => {
        let room;
        socket.on('init', function (msg) {
            gameIdentifier.decodeIdentifier(msg.identifierRaw, msg.identifierEncrypted).then(message => {
                if (!message.status) {
                    return;
                }
                if (rooms.hasRoomById(message.id)) {
                    room = rooms.getRoom(message.id);

                    room.connectedPlayers.connect(message.user, socket.id);

                    socket.join(room.id);//Dołączenie socketu do pokoju 
                    basicsGamesData.getBasicData(room.getGameName()).socketOnConnect(socket, io, room, message.user,rooms);//Wydarzenia po połączeniu
                    basicsGamesData.getBasicData(room.getGameName()).socketDo(socket, io, room, message.user,rooms);//Obsługa eventów z socketu wybranej gry 
                }
            })

        })

        socket.on('disconnecting', () => {
            if (typeof room === 'undefined' || !rooms.hasRoomById(room.id)) {
                return;
            }

            room.connectedPlayers.disconnect(socket.id);
            basicsGamesData.getBasicData(room.getGameName()).socketOnDisconnect(socket, io, room);
            if (room.connectedPlayers.size() == 0) {
                rooms.removeRoom(room.id);
            } 
        })
    });
}