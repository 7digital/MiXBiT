var rooms = require('./rooms');
/*
 * GET home page.
 */
exports.index = function home(req, res, next) {
	rooms.all(function allRooms(err, rooms) {
		if (err) {
			return next(err)
		}

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
	rooms.create({
		name: req.body.name,
		genre: req.body.genre
	}, function roomCreated(err, roomId) {
		if (err) {
			return next(err);
		}

		return res.redirect('/room/' + roomId);
	});
};
