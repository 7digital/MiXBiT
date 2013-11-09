define([
	'lodash',
	'socketio'
], function (_, socketio) {
	'use strict';

	function Io(onConnectCallback, onQueueCallback) {
		console.log('IO | init');
		var self = this;
		this.socket = socketio.connect();
		this.onConnectCallback = onConnectCallback;
		this.onQueueCallback = onQueueCallback;
		this.socket.on('connect', function () {
			setTimeout(function () {
				self.onConnect();
			}, 2000);
		});
	}

	Io.prototype.onConnect = function () {
		console.log('IO | connect');
		var self = this;
		this.onConnectCallback();
		var url = document.URL;
		var roomId = url.substring(url.lastIndexOf('/'));
		console.log('Client session id %s', self.socket.sessionid);
		console.log('Joining room %s', roomId);
		this.socket.emit('room', roomId);
		this.socket.on('queue', function (queue) {
			setTimeout(function () {
				self.onQueue(queue);
			}, 2000);

		});
	};

	Io.prototype.onQueue = function (queue) {
		console.log('IO | queue');
		// console.log(queue);
		this.onQueueCallback(queue);
	};

	return Io;

});
