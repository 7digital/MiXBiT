var rooms = require('./rooms');

module.exports = function configureSocketIo(io) {

	io.sockets.on('connection', function (socket) {

		socket.on('room', function joinRoom(room) {
			console.log('Client joined room %s', room);
			socket.join(room);
			socket.in(room).emit('new-listener');

			console.log('Getting room %s', room);
			rooms.get(room, function (err, room) {
				if (err) {
					console.log('Error getting room');
					console.error(err);
					return socket.emit('err');
				}
				room.serverTime = new Date();

				console.log('Sending room state');
				socket.emit('room-state', room);
			});

		});
	});

};
