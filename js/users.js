var bcrypt = require('bcrypt');


let users = new Map();
//Szablon
// nick : { encryptedPassword , gamesStats:[]}


function getEncryptedPassword(nick) {
    return users.get(nick).encryptedPassword
}


module.exports.exist = function exist(nick) {
    return users.has(nick);
}

/**
* Zalogowanie (POST)"możliwość zalogowania się"
* @param {string } nick 
* @param {string } password
*/
module.exports.addNewUser = async function (nick, password) {
    var rounds = 12;
    var encryptedPassword = await bcrypt.hash(password, rounds);
    users.set(nick, { encryptedPassword, gameStats: [] })
}


module.exports.isLoginCorrect = async function (nick, password) {
    if (!this.exist(nick))
        return false;
    var passwordInBase = getEncryptedPassword(nick);
    let value = await bcrypt.compare(password, passwordInBase);
    return value;
}


module.exports.getAll = function () {
    return users;
}