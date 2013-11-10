var rooms = require('./rooms');
var robot = require('./robot-dj');

/*
 * GET home page.
 */
exports.index = function home(req, res, next) {
	rooms.all(function allRooms(err, rooms) {
		if (err) {
			return next(err)
		}

		res.render('home', {
			title: '7digital NKO - MiXBiT - What\'s your weapon of choice',
			rooms: rooms
		});
	});
};

/*
 * GET /room/:id.
 */
exports.room = function listen(req, res){
	res.render('room', { title: '7digital NKO4 - MiXBiT - Listening...', id: req.params.id });
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

		robot.monitor(roomId);
		return res.redirect('/room/' + roomId);
	});
};
