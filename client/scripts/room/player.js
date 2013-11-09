define([
	'lodash',
	'audiojs'
], function (_, audiojs) {
	'use strict';

	function Player(stateChangedCallback, $room) {
		console.log('Player | init');
		this.stateChangedCallback = stateChangedCallback;
		this._playlist = null;
		this._currentTrack = null;
		this.$room = $room;
	}

	Player.prototype.resetAudio = function () {
		console.log('Player | create audio');
		var self = this;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.$room.find('audio.player').remove();
		this.$room.find('.audiojs').remove();
		this.$room.append('<audio preload class="player"></audio>');
		this.audioJsPlayer = audiojs.createAll({
			trackEnded: function () {
				self.trackEnded();
			},
			loadError: function() {
				console.error('PLAYER ERROR, playing again');
				self.play();
			}
		})[0];
	};

	Player.prototype.play = function () {
		console.log('Player | play');
		this.resetAudio();
		this._currentTrack = this._playlist.getCurrentTrack();
		this.audioJsPlayer.load(this._currentTrack.url);
		this.skipTo(this._currentTrack.position);
	};

	Player.prototype.skipTo = function (position) {
		console.log('Player | skip to %s%', position * 100);
		var self = this;
		var lastPartialSkip = new Date();
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
				self.audioJsPlayer.play();
				self.audioJsPlayer.skipTo(position);
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
		if (this._playlist.next()) {
			this.play();
		} else {
			this.stateChangedCallback();
		}
	};

	Player.prototype.setPlaylist = function (playlist) {
		console.log('Player | update playlist');
		this._playlist = playlist;
	};

	return Player;

});
