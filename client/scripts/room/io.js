define([
	'lodash',
	'socketio'
], function (_, socketio) {
	'use strict';

	function Io(onConnectCallback, onRoomStateCallback, onRoomErrorCallback) {
		console.log('IO | init');
		var self = this;
		this.socket = socketio.connect();
		this.onConnectCallback = onConnectCallback;
		this.onRoomStateCallback = onRoomStateCallback;
		this.onRoomErrorCallback = onRoomErrorCallback;
		this.socket.on('connect', function () {
			setTimeout(function () {
				self.onConnect();
			}, 1000);
		});
	}

	Io.prototype.onConnect = function () {
		console.log('IO | connect');
		var self = this;
		this.onConnectCallback();
		var url = document.URL;
		var roomId = url.substring(url.lastIndexOf('/') + 1);
		console.log('Client session id %s', self.socket.sessionid);
		console.log('Joining room %s', roomId);
		this.socket.emit('room', roomId);
		this.socket.on('room-state', function (roomState) {
			setTimeout(function () {
				self.onRoomState(roomState);
			}, 1000);
		});
		this.socket.on('room-error', function (roomError) {
			setTimeout(function () {
				self.onRoomError(roomError);
			}, 1000);
		});
	};

	Io.prototype.onRoomState = function (roomState) {
		console.log('IO | room state');
		console.log(roomState);
		this.onRoomStateCallback(roomState);
	};

	Io.prototype.onRoomError = function (roomError) {
		console.log('IO | room error');
		console.error(roomError);
		this.onRoomErrorCallback(roomError);
	};

	return Io;

});
