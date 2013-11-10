var rooms = require('./rooms');
var trackChooser = require('./track-chooser');
var socketServer;

function listenForConnections(io) {
	socketServer = io;

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
					return socket.emit('room-error', 'Invalid room');
				}

				// room doesn't exist
				if (!room) {
					return socket.emit('room-error', 'Invalid room');
				}

				room.serverTime = new Date();
				room.current.url = trackChooser.getTrackUrl(
					room.current.trackId, socket.sessionId);

				room.queue.forEach(function addTrackUrl(track, idx) {
					track.url = trackChooser.getTrackUrl(track.trackId, 
						socket.sessionId);
				});

				console.log('Sending room state');
				socket.emit('room-state', room);
			});

		});
	});
} 

function updateRoom(room) {
	if (socketServer) {
		socketServer.of(room.id).emit('room-state', room);
	} else {
		console.error('No socket server to broadcast room update');
	}
}

module.exports = {
	listen: listenForConnections,
	update: updateRoom
};
