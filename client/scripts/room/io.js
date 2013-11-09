define([
	'lodash',
	'socketio'
], function (_, socketio) {
	'use strict';

	function Io(onConnect, onQueue) {
		var self = this;
		this.socket = socketio.connect();
		this.onConnect = onConnect;
		this.onQueue = onQueue;

		this.socket.on('connect', function () {
			self.onConnect();
			var url = document.URL;
			var roomId = url.substring(url.lastIndexOf('/'));
			console.log('Client session id %s', self.socket.sessionid);
			console.log('Joining room %s', roomId);
			self.socket.emit('room', roomId);
			self.socket.on('queue', function (queue) {
				self.onQueue(queue);
			});
		});
	}

	return Io;

});
