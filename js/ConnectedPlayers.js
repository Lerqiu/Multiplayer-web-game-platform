let UserCookie = require('./UserCookie')

module.exports = class ConnectedPlayers {
    constructor() {
        this.data = new Map();
    }
    /**
     * 
     * @param {UserCookie} user 
     * @param {*} socketId 
     */
    connect(user, socketId) {
        if (this.data.has(user.stringify())) {
            this.data.get(user.stringify()).push(socketId);
        } else {
            this.data.set(user.stringify(), [socketId]);
        }
    }

    disconnect(socketId) {
        let newData = new Map();
        this.data.forEach((val, key) => {
            let ids = val.filter(val => {
                return val != socketId;
            })
            if (ids.length > 0)
                newData.set(key, ids);
        })
        this.data = newData;
    }

    size() {
        return Array.from(this.data.keys()).length;
    }
    /**
     * 
     * @param {UserCookie} user 
     * @returns {boolean}
     */
    isConnected(user) {
        return this.data.has(user.stringify());
    }

    getAllConnected() {
        let result = Array(this.data.keys)
        result.forEach(elem => {
            console.log(elem)
        })
        return result
    }
}
