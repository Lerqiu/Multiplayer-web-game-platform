





module.exports.addRooms = function (app, authorize) {
    app.get('/rooms', authorize, (req, res) => {
        console.log("Start: rooms");
        
    });
}