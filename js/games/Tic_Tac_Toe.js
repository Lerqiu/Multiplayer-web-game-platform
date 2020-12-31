var bcrypt = require('bcrypt');

module.exports.run = async function (identifier, room, user, req, res) {
    res.render('games/TicTacToe/index.ejs', {
        guid: room.guid,
        user: JSON.stringify(user),
        identifierRaw: identifier.raw,
        identifierEncrypted: identifier.encrypted
    });
}