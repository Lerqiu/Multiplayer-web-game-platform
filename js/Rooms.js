var bcrypt = require('bcrypt');
const { Guid } = require('js-guid');
var Room = require('./Room');

module.exports = class Rooms {
    constructor() {
        this.data = new Map();
    }

    //Lista pokoi do których można dołączyć (które warto wyświetlić jako dostępne)
    getAvailableRooms() {
        return Array.from(this.data.values()).filter(room => {
            return room.canJoin();
        });;
    }

    getRoomId(roomName) {
        for (let room of rooms.values()) {
            if (room.getName() === roomName)
                return room.getId();
        }
        throw new Error(`Brak pokoju o takiej nazwie: ${roomName}`);
    }

    hasRoomByName(roomName) {
        return Array.from(this.data.values()).filter(room => {
            return roomName === room.getName();
        }).length > 0;
    }
    hasRoomById(roomId) {
        return this.data.has(roomId);
    }
    removeRoom(roomId) {
        this.data.delete(roomId);
    }

    getRoom(roomId) {
        return this.data.get(roomId);
    }

    getFreeId() {
        let guid;
        do {
            guid = Guid.newGuid().toString();
        } while (this.hasRoomById(guid));
        return guid;
    }

    async addRoom(roomName, gameName, rawRoomPassword) {
        let rounds = 12;

        let freeId = this.getFreeId();
        let encryptedPassword = "";
        let en = await bcrypt.hash(rawRoomPassword, rounds);
        if (rawRoomPassword != "")
            encryptedPassword = en;

        let newRoom = new Room(freeId, roomName, gameName, encryptedPassword);
        this.data.set(freeId, newRoom);
        return newRoom;
    }
}