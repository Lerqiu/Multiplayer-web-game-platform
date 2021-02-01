

module.exports = class UserCookie {
    constructor(nick, mode) {
        this.nick = nick;
        this.mode = mode;
	this.won = 0;
	this.lost = 0;
	this.remis = 0;
    }

    stringify() {
        return JSON.stringify({ nick: this.nick, mode: this.mode, won: this.won, lost: this.lost, remis: this.remis})
    }

    toObject() {
        return { nick: this.nick, mode: this.mode, won: this.won, lost: this.lost, remis: this.remis};
    }


    isAnonymous() {
        return this.mode === "anonymous";
    }

    isRegistered() {
        return this.mode === "registered";
    }

    getNick() {
        return this.nick;
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

    /**
     * Sprawdzenie czy obiekty przetrzymują identyczne wartości
     * @param {UserCookie} user2 
     */
    isIdentical(user2) {
        return this.nick === user2.getNick() && this.mode === user2.mode;
    }

    static FromObject(obj) {
        return new UserCookie(obj.nick, obj.mode, obj.won, obj.lost, obj.remis);
    }

    static Parse(cookie) {
        let parsedCookie = JSON.parse(cookie);
        return new UserCookie(parsedCookie.nick, parsedCookie.mode, parsedCookie.won, parsedCookie.lost, parsedCookie.remis);
    }

    /**
    * Tworzy obiekt ciastka dla anonimowego użytkownika
    * @param {string } nick
    */
    static MakeAnonymous(nick) {
        return new UserCookie(nick, "anonymous");
    }

    /**
    * Tworzy obiekt ciastka dla zarejestrowanego użytkownika
    * @param {string } nick
    */
    static MakeRegistered(nick) {
        return new UserCookie(nick, "registered");
    }
}
