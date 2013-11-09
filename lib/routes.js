var rooms = require('./rooms');
/*
 * GET home page.
 */
exports.index = function home(req, res) {
	rooms.all(function allRooms(rooms) {
		res.render('home', { 
			title: '7digital Knockout',
			rooms: rooms
		});
	});
};

/*
 * GET /room/:id.
 */
exports.room = function listen(req, res){
	res.render('room', { title: 'Music Room', id: req.params.id });
};

/*
 * POST /room/create
 */
exports.createRoom = function createRoom(req, res){
	res.render('room', { title: 'Music Room', id: req.params.id });
};
