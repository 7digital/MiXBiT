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

		socket.on('queue', function (data) {
			socket.emit('queue', [{ url: 'http://www.google.com/' }]);
		});
	});

};
