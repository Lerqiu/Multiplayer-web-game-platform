let UserCookie = require('./UserCookie')
var bcrypt = require('bcrypt');

module.exports.makeIdentifier =
    /**
     * Tworzenie identyfikatora (by rozpoznać który z użytkowników nawiązuje połączenie)
     * @param {string} id 
     * @param {UserCookie} user 
     */
    async function makeIdentifier(id, user) {
        var rounds = 12;
        var data = JSON.stringify({ id, user: user.toObject() });

        var encryptedData = await bcrypt.hash(data, rounds);

        var identifier = { raw: data, encrypted: encryptedData };

        return identifier;
    };

module.exports.decodeIdentifier =
    /**
    * Dekodowanie identyfikatora
    * @param {string} identifierRaw
    * @param {string} identifierEncrypted 
    */
    async function decodeIdentifier(identifierRaw, identifierEncrypted) {
        let status = await bcrypt.compare(identifierRaw, identifierEncrypted);
        let data = {};
        if (status) {
            data = JSON.parse(identifierRaw);
            data.user = UserCookie.FromObject(data.user);
        }

        return { status, id: data.id, user: data.user }
    }