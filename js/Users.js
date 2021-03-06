var bcrypt = require('bcrypt');
var { Client } = require('pg');

module.exports = class Users {
    constructor(client, dataOfUsers) {
        this.client = client;
        this.data = dataOfUsers;// nick : { encryptedPassword , gamesStats:[]}
    }

    static newAndConnect() {
        return new Promise((resolve, reject) => {
            (async function () {
                //Ustawienie parametrów połączenia z bazą danych
                const client = new Client({
                    connectionString: process.env.DATABASE_URL,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });

                //Rozłączenie z bazą danych podczas zakończenia działania programu
                process.on('SIGHUP', function () {
                    client.end();
                });

                //Łączenie z bazą danych
                client.connect();

                //Pobranie danych z bazy
                let dataOfUsers = new Map();
                try {
                    let result = await client.query('SELECT * FROM USERS;');
                    result.rows.forEach(row => {
                        dataOfUsers.set(row.nick, { encryptedPassword: row.userpassword, won: 0, lost: 0, remis: 0, gamesStats: [] });
                    })
                    resolve(new Users(client, dataOfUsers));
                } catch (err) {
                    console.log(err);
                    reject(err)
                }
            })();
        });
    }

    /**
    * Uzyskanie (w zaszyfrowanej formie) hasło wybranego użytkownika
    * @param {string } nick 
    * @return {string} hasło w zaszyfrowanej formie
    */
    getPassword(nick) {
        return this.data.get(nick).encryptedPassword
    }

    async getStats(nick) {
        if (this.hasUser(nick)) {
            let result = await this.client.query('SELECT * FROM Stats WHERE Nick = $1;', [nick]);

            if (result.rows.length > 0) {
                return { won: result.rows[0].won, lost: result.rows[0].lost, remis: result.rows[0].remis }
            }
        }
        console.log(`Brak użytkownika ${nick}. Zostaną zwrócone domyślne statystyki`)
        return { won: 0, lost: 0, remis: 0 }
    }

    addW(nick) {
        try {
            if (this.hasUser(nick)) {
                let classObject = this;
                (async function () {
                    let stats = await classObject.getStats(nick);
                    await classObject.client.query('UPDATE Stats SET won = $2 WHERE Nick = $1;', [nick, stats.won + 1]);
                })()
            }
            console.log(`Wygrał gracz: ${nick}`)
        } catch (err) {
            console.log(err)
        }
    }
    addL(nick) {
        try {
            if (this.hasUser(nick)) {
                let classObject = this;
                (async function () {
                    let stats = await classObject.getStats(nick);
                    await classObject.client.query('UPDATE Stats SET lost = $2 WHERE Nick = $1;', [nick, stats.lost + 1]);
                })()
            }
            console.log(`Przegrał gracz: ${nick}`)
        } catch (err) {
            console.log(err)
        }
    }
    addR(nick) {
        try {
            if (this.hasUser(nick)) {
                let classObject = this;
                (async function () {
                    let stats = await classObject.getStats(nick);
                    await classObject.client.query('UPDATE Stats SET remis = $2 WHERE Nick = $1;', [nick, stats.remis + 1]);
                })()
            }
            console.log(`Zremisował gracz: ${nick}`)
        } catch (err) {
            console.log(err)
        }
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
            await this.client.query(`INSERT INTO STATS (Nick,won,lost,remis) VALUES ($1,$2,$3,$4);`, [nick, 0, 0, 0])
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
