define([
	'lodash',
	'audiojs',
	'room/ui',
	'room/io',
	'room/playlist'
], function (_, audiojs, Ui, Io, Playlist) {
	'use strict';

	var Room = (function () {

		function Room() {
			console.log('Room | init');
			var self = this;
			this.playlist = new Playlist();
			this.player = audiojs.createAll({
				trackEnded: function () {
					self.play(self.playlist.nextTrack());
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

		return Room;

	})();

	var room = new Room();
	var ui = new Ui(room);
	var io = new Io(
		function onConnect() {
			console.log('Main | Io Connected');
		},
		function onQueue(queue) {
			console.log('Main | Io Queue');
			console.log(queue);
			var playlist = new Playlist();
			room.play(playlist.currentTrack());
			ui.update();
		}
	);

});
