define([
	'lodash',
	'audiojs'
], function (_, audiojs) {
	'use strict';

	function Player(stateChangedCallback) {
		console.log('Player | init');
		var self = this;
		this.stateChangedCallback = stateChangedCallback;
		this._playlist = null;
		this._currentTrack = null;
		this.audioJsPlayer = audiojs.createAll({
			trackEnded: function () {
				self.trackEnded();
			}
		})[0];
	}

	Player.prototype.play = function () {
		console.log('Player | play');
		this._currentTrack = this._playlist.getCurrentTrack();
		this.audioJsPlayer.load(this._currentTrack.url);
		this.skipTo(this._currentTrack.position);
	};

	Player.prototype.skipTo = function (position) {
		console.log('Player | skip to %s%', position * 100);
		var self = this;
		var lastPartialSkip = 0;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.playIntervalId = setInterval(function () {
			if (!self.audioJsPlayer.loadedPercent) {
				return;
			}
			if (self.audioJsPlayer.loadedPercent > position) {
				console.log('Player | skipping to %s%', position * 100);
				clearInterval(self.playIntervalId);
				self.audioJsPlayer.skipTo(position);
				self.audioJsPlayer.play();
				self.stateChangedCallback();
			} else {
				var now = new Date();
				var elapsed = now - lastPartialSkip;
				if (elapsed > 300) {
					var partialPosition = self.audioJsPlayer.loadedPercent * 0.75;
					console.log('Player | partial skip to %s%', partialPosition * 100);
					self.audioJsPlayer.skipTo(partialPosition);
					lastPartialSkip = now;
				}
			}
		}, 100);
	};

	Player.prototype.trackEnded = function () {
		console.log('Player | track ended');
		this._playlist.next();
		this.play();
	};

	Player.prototype.setPlaylist = function (playlist) {
		console.log('Player | update playlist');
		this._playlist = playlist;
	};

	return Player;

});
