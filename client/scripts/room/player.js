define([
	'lodash',
	'audiojs'
], function (_, audiojs) {
	'use strict';

	function Player() {
		console.log('Player | init');
		var self = this;
		this.playlist = null;
		this.audioJsPlayer = audiojs.createAll({
			trackEnded: function () {
				self.trackEnded();
			}
		})[0];
	}

	Player.prototype.play = function () {
		console.log('Player | play');
		var self = this;
		var currentTrack = this.playlist.getCurrentTrack();
		this.audioJsPlayer.load(currentTrack.url);
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.playIntervalId = setInterval(function () {
			if (self.audioJsPlayer.loadedPercent > currentTrack.position) {
				clearInterval(self.playIntervalId);
				self.audioJsPlayer.skipTo(currentTrack.position);
				self.audioJsPlayer.play();
			}
		}, 100);
	};

	Player.prototype.trackEnded = function () {
		console.log('Player | track ended');
		this.playlist.next();
		this.play();
	};

	Player.prototype.updatePlaylist = function (playlist) {
		console.log('Player | update playlist');
		this.playlist = playlist;
	};

	return Player;

});
