var bcrypt = require('bcrypt');
const postgres = require('postgres')

const sql = postgres() 

module.exports = sql

module.exports = class Users {
    constructor() {
        this.data = new Map();// nick : { encryptedPassword , gamesStats:[]}
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
        this.data.set(nick, { encryptedPassword, gameStats: [] })
	const [new_user] = await sql`
 	 insert into users (
    	nick, encryptedPassword
  	) values (
   	 nick, password
 	 )`
    }

    async areLoginDataCorrect(nick, password) {
        if (!this.hasUser(nick))
            return false;
        var passwordInBase = this.getPassword(nick);
        let isCorrect = await bcrypt.compare(password, passwordInBase);
        return isCorrect;
    }
}
