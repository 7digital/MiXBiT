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
			this.playlist = new Playlist();
			this.ui.setPlaylist(self.playlist);
			this.player = new Player(this.ui.$room);
			this.player.setPlaylist(this.playlist);
			this.ui.setPlayer(this.player);
			this.io = new Io(
				function onConnect() {
					console.log('Main | io connected');
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
			this.ui.setIo(this.io);
			this.ui.trackChanges();
		}

		return Room;

	})();

	var room = new Room();

});
