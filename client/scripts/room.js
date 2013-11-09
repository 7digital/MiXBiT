define([
	'lodash',
	'jquery'
], function (_, $) {

	var Room = (function () {

		function Room() {

		}

		Room.prototype.getCurrentTrack = function () {
			return 'Current Track';
		};

		Room.prototype.getTrackQueue = function () {
			return [
				'Track 1',
				'Track 2',
				'Track 3'
			];
		};

		return Room;

	})();

	var RoomUi = (function() {

		function RoomUi(room) {
			this.room = room;
			this.$room = $('.room');
			this.$currentTrack = this.$room.find('.current-track');
			this.$trackQueue = this.$room.find('.track-queue');
		}

		RoomUi.prototype.update = function () {
			var currentTrack = room.getCurrentTrack();
			var trackQueue = room.getTrackQueue();
			var self = this;
			this.$currentTrack.text(currentTrack);
			_.forEach(trackQueue, function (track) {
				self.$trackQueue.append('<li>' + track + '</li>')
			});
		};

		return RoomUi;

	})();

	var room = new Room();
	var roomUi = new RoomUi(room);

	roomUi.update();

});