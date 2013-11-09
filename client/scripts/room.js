define([
	'lodash',
	'jquery'
], function (_, $) {
	'use strict';

	var Room = (function () {

		function Room() {

		}

		Room.prototype.getTrackHistory = function () {
			return [
				'Track 1',
				'Track 2',
				'Track 3'
			];
		};

		Room.prototype.getCurrentTrack = function () {
			return {
				title: 'Current Track 4',
				position: 2.5
			};
		};

		Room.prototype.getTrackQueue = function () {
			return [
				'Track 5',
				'Track 6',
				'Track 7',
				'Track 8',
				'Track 9',
				'Track 10',
			];
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
			this.$currentTrackTitle.text(currentTrack.title);
			this.$currentTrackPosition.text(currentTrack.position + 's');
			_.forEach(trackQueue, function (track) {
				self.$trackQueue.append('<li>' + track + '</li>');
			});
		};

		return RoomUi;

	})();

	var room = new Room();
	var roomUi = new RoomUi(room);

	roomUi.update();

});