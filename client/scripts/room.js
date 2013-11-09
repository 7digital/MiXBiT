define([
	'lodash',
	'jquery',
	'socketio',
	'audiojs'
], function (_, $, io, audiojs) {
	'use strict';

	var socket = io.connect();

	socket.on('connect', function () {
		var url = document.URL;
		var room = url.substring(url.lastIndexOf('/'));

		console.log('Joining room %s', room);
		socket.emit('room', room);
		socket.on('queue', function (queue) {
			console.log(queue);
		});
	});

	var Room = (function () {

		function Room() {
			var self = this;
			this.player = audiojs.createAll({
				trackEnded: function () {
					self.play(self.getNextTrack());
				}
			})[0];
		}

		Room.prototype.play = function (track) {
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
			return [
				'http://s3.amazonaws.com/audiojs/01-dead-wrong-intro.mp3',
				'http://s3.amazonaws.com/audiojs/02-juicy-r.mp3',
				'http://s3.amazonaws.com/audiojs/03-its-all-about-the-crystalizabeths.mp3'
			];
		};

		Room.prototype.getCurrentTrack = function () {
			return {
				url: 'http://s3.amazonaws.com/audiojs/04-islands-is-the-limit.mp3',
				position: 0.3
			};
		};

		Room.prototype.getTrackQueue = function () {
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
			return this.getCurrentTrack();
		};

		return Room;

	})();

	var RoomUi = (function() {

		function RoomUi(room) {
			this.room = room;
			this.$room = $('.room');
			this.$trackHistory = this.$room.find('.track-history');
			this.$currentTrackTitle = this.$room.find('.current-track-title');
			this.$currentTrackPosition = this.$room.find('.current-track-position');
			this.$trackQueue = this.$room.find('.track-queue');
		}

		RoomUi.prototype.update = function () {
			var trackHistory = room.getTrackHistory();
			var currentTrack = room.getCurrentTrack();
			var trackQueue = room.getTrackQueue();
			var self = this;
			_.forEach(trackHistory, function (track) {
				self.$trackHistory.append('<li>' + track + '</li>');
			});
			this.$currentTrackTitle.text(currentTrack.url);
			this.$currentTrackPosition.text(currentTrack.position + 's');
			_.forEach(trackQueue, function (track) {
				self.$trackQueue.append('<li>' + track + '</li>');
			});
		};

		return RoomUi;

	})();

	var room = new Room();
	var roomUi = new RoomUi(room);

	room.play(room.getCurrentTrack());
	roomUi.update();
	
});
