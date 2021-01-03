let basicsGamesData = require('./basicsGamesData');
let ConnectedPlayers = require('./ConnectedPlayers')

module.exports = class Room {
    constructor(roomId, roomName, gameName, roomPassword) {
        this.id = roomId;
        this.connectedPlayers = new ConnectedPlayers();


        let roomData = {};
        this.roomData = roomData;
        roomData.roomName = roomName;
        roomData.gameName = gameName;
        roomData.roomPassword = roomPassword;
        roomData.link = "/room/" + roomId;
        roomData.maxPlayers = basicsGamesData.getBasicData(gameName).maxPlayers;
    }

    canJoin() { return this.presentPlayers() < this.roomData.maxPlayers }
    presentPlayers() { return this.connectedPlayers.size() }
    maxPlayers() { return this.roomData.maxPlayers }

    getName() {
        return this.roomData.roomName;
    }

    getGameName() {
        return this.roomData.gameName;
    }

    getId() {
        return this.id;
    }

    getLink() {
        return this.roomData.link;
    }

    isPasswordRequired() {
        return this.roomData.roomPassword != "";
    }

    getPassword() {
        return this.roomData.roomPassword;
    }

}