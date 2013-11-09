module.exports = function configureSocketIo(io) {

	io.sockets.on('connection', function (socket) {
		socket.emit('queue', {
			currentTrack: {
				url: 'http://www.google.com/'
			},
			queue: [
				{
					url: 'http://www.google.com/'
				}
			]
		});

		socket.on('room', function joinRoom(room) {
			console.log('Client joined room %s', room);
			socket.join(room);
			socket.in(room).emit('new-listener');
			socket.emit('queue', function (data) {
				socket.emit('queue', [{ url: 'http://www.google.com/' }]);
			});
		});
	});

};
