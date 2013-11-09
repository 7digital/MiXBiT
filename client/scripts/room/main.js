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
			this.ui = new Ui();
			this.player = new Player(
				function stateChanged() {
					console.log('Main | player state changed');
					self.ui.update();
				}, this.ui.$room
			);
			this.io = new Io(
				function onConnect() {
					console.log('Main | io connected');
					self.ui.connected();
				},
				function onRoomState(roomState) {
					console.log('Main | io room state');
					var playlist = new Playlist();
					self.player.setPlaylist(playlist);
					self.player.play();
					self.ui.setPlaylist(playlist);
					self.ui.update();
				}
			);
		}

		return Room;

	})();

	var room = new Room();

});
