define([
	'lodash',
	'jquery',
	'socketio',
	'audiojs',
	'room-ui'
], function (_, $, io, audiojs, RoomUi) {
	'use strict';

	var socket = io.connect();

	socket.on('connect', function () {
		var url = document.URL;
		var roomId = url.substring(url.lastIndexOf('/'));

		console.log('Client session id %s', this.socket.sessionid);
		console.log('Joining room %s', roomId);
		socket.emit('room', roomId);

		socket.on('queue', function (queue) {
			console.log(queue);

			room.play(room.getCurrentTrack());
			roomUi.update();

		});
	});

	var Room = (function () {

		function Room() {
			console.log('Room | init');
			var self = this;
			this.player = audiojs.createAll({
				trackEnded: function () {
					self.play(self.getNextTrack());
				}
			})[0];
		}

		Room.prototype.play = function (track) {
			console.log('Room | play');
			var self = this;
			this.player.load(track.url);
			if (this.playIntervalId) {
				clearInterval(this.playIntervalId);
			}
			this.playIntervalId = setInterval(function () {
				if (self.player.loadedPercent > track.position) {
					clearInterval(self.playIntervalId);
					self.player.skipTo(track.position);
					self.player.play();
				}
			}, 100);
		};

		Room.prototype.getTrackHistory = function () {
			console.log('Room | track history');
			return [
				'http://s3.amazonaws.com/audiojs/01-dead-wrong-intro.mp3',
				'http://s3.amazonaws.com/audiojs/02-juicy-r.mp3',
				'http://s3.amazonaws.com/audiojs/03-its-all-about-the-crystalizabeths.mp3'
			];
		};

		Room.prototype.getCurrentTrack = function () {
			console.log('Room | current track');
			return {
				url: 'http://s3.amazonaws.com/audiojs/04-islands-is-the-limit.mp3',
				position: 0.3
			};
		};

		Room.prototype.getTrackQueue = function () {
			console.log('Room | track queue');
			return [
				'http://s3.amazonaws.com/audiojs/05-one-more-chance-for-a-heart-to-skip-a-beat.mp3',
				'http://s3.amazonaws.com/audiojs/06-suicidal-fantasy.mp3',
				'http://s3.amazonaws.com/audiojs/07-everyday-shelter.mp3',
				'http://s3.amazonaws.com/audiojs/08-basic-hypnosis.mp3',
				'http://s3.amazonaws.com/audiojs/09-infinite-victory.mp3',
				'http://s3.amazonaws.com/audiojs/10-the-curious-incident-of-big-poppa-in-the-nighttime.mp3',
				'http://s3.amazonaws.com/audiojs/11-mo-stars-mo-problems.mp3'
			];
		};

		Room.prototype.getNextTrack = function () {
			console.log('Room | next track');
			return this.getCurrentTrack();
		};

		return Room;

	})();

	var room = new Room();
	var roomUi = new RoomUi(room);

});
