var bcrypt = require('bcrypt');


module.exports = class Users {
    constructor(client) {
        this.client = client;
        this.data = new Map();// nick : { encryptedPassword, won, lost, remis, gamesStats:[]}

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
	var won = 0;
	var lost = 0;
	var remis = 0;
        try {
            await this.client.query(`INSERT INTO USERS (Nick,UserPassword) VALUES ($1,$2);`, [nick, encryptedPassword])
            this.data.set(nick, { encryptedPassword, gameStats: [] })
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
    getWon() {
        return this.won;
    }
    getLost() {
        return this.lost;
    }
    getRemis() {
        return this.remis;
    }
    addWon(){
	this.won+=1;
    }
    addLost(){
	this.lost+=1;
    }
    addRemis(){
	this.remis+=1;
    }

}
