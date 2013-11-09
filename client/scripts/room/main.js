define([
	'lodash',
	'room/ui',
	'room/io',
	'room/player',
	'room/playlist'
], function (_, Ui, Io, Player, Playlist) {
	'use strict';

	var Room = (function () {

		function Room() {
			console.log('Room | init');
			var self = this;
			this.player = new Player();
			this.ui = new Ui(this);
			this.io = new Io(
				function onConnect() {
					console.log('Main | Io Connected');
					self.ui.connected();
				},
				function onQueue(queue) {
					console.log('Main | Io Queue');
					var playlist = new Playlist();
					self.player.updatePlaylist(playlist);
					self.player.play();
					self.ui.update(playlist);
				}
			);
		}

		return Room;

	})();

	var room = new Room();

});
