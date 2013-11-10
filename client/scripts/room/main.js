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
			this.playlist = new Playlist(
				function playlistChanged() {
					console.log('Main | playlist changed');
					self.ui.update();
				}
			);
			this.ui.setPlaylist(self.playlist);
			this.player = new Player(
				function stateChanged(playerState) {
					console.log('Main | player state changed');
					self.ui.updatePlayer(playerState);
				}, this.ui.$room
			);
			self.player.setPlaylist(self.playlist);
			this.io = new Io(
				function onConnect() {
					console.log('Main | io connected');
					self.ui.connected();
				},
				function onRoomState(roomState) {
					console.log('Main | io room state');
					self.playlist.loadFromRoomState(roomState);
					self.ui.setRoomState(roomState);
					self.player.play();
				},
				function onRoomError(roomError) {
					console.log('Main | io room error');
					document.location.href = '/';
				}
			);
		}

		return Room;

	})();

	var room = new Room();

});
