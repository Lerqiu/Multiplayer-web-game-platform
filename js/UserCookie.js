

module.exports = class UserCookie {
    constructor(nick, mode) {
        this.nick = nick;
        this.mode = mode;
    }

    stringify() {
        return JSON.stringify({ nick: this.nick, mode: this.mode })
    }

    toObject() {
        return { nick: this.nick, mode: this.mode };
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

    /**
     * Sprawdzenie czy obiekty przetrzymują identyczne wartości
     * @param {UserCookie} user2 
     */
    isIdentical(user2) {
        return this.nick === user2.getNick() && this.mode === user2.mode;
    }

    static FromObject(obj) {
        return new UserCookie(obj.nick, obj.mode);
    }

    static Parse(cookie) {
        let parsedCookie = JSON.parse(cookie);
        return new UserCookie(parsedCookie.nick, parsedCookie.mode);
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
