var bcrypt = require('bcrypt');


module.exports = class Users {
    constructor(client) {
        this.client = client;
        this.data = new Map();// nick : { encryptedPassword , gamesStats:[]}

        (async function () {
            try {
                let result = await client.query('SELECT * FROM USERS;');
                result.forEach(row => {
                    this.data.set(row[0], { encryptedPassword: row[1], won, lost, remis, gamesStats: [] });
                })
            } catch (err) {
                console.log(err);
            }
        })();
    }

    /**
    * Uzyskanie (w zaszyfrowanej formie) hasło wybranego użytkownika
    * @param {string } nick 
    * @return {string} hasło w zaszyfrowanej formie
    */
    getPassword(nick) {
        return this.data.get(nick).encryptedPassword
    }
    getW(nick) {
        return this.data.get(nick).won
    }
    getL(nick) {
        return this.data.get(nick).lost
    }
    getR(nick) {
        return this.data.get(nick).remis
    }
    addWon(nick){
	this.data.get(nick).won+=1;
    }
    addLost(nick){
	this.data.get(nick).lost+=1;
    }
    addRemis(nick){
	this.data.get(nick).remis+=1;
    }

    /**
    * Sprawdza czy w bazie znajduje się użytkownik o takiej nazwie
    * @param {string } nick 
    * @return {boolean}
    */
    hasUser(nick) {
        return this.data.has(nick);
    }

    /**
    * Dodanie nowego użytkownika
    * @param {string } nick 
    * @param {string } password
    */
    async addNew(nick, password) {
        var rounds = 12;
        var encryptedPassword = await bcrypt.hash(password, rounds);
	var won = 42;
	var lost = 42;
	var remis = 3;
        try {
            await this.client.query(`INSERT INTO USERS (Nick,UserPassword) VALUES ($1,$2);`, [nick, encryptedPassword])
            this.data.set(nick, { encryptedPassword, won, lost, remis, gameStats: [] })
        } catch (err) {
            console.log(err);
        }
    }

    async areLoginDataCorrect(nick, password) {
        if (!this.hasUser(nick))
            return false;
        var passwordInBase = this.getPassword(nick);
        let isCorrect = await bcrypt.compare(password, passwordInBase);
        return isCorrect;
    }
}
