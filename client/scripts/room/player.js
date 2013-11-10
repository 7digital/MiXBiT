define([
	'lodash',
	'audiojs'
], function (_, audiojs) {
	'use strict';

	function Player($room) {
		console.log('Player | init');
		this.$room = $room;
		this.$player = $room.find('.debug-player-container');
		this._playlist = null;
		this._currentTrack = null;
		this._errorCount = 0;
	}

	Player.prototype.setPlaylist = function (playlist) {
		console.log('Player | set playlist');
		this._playlist = playlist;
	};

	Player.prototype.play = function () {
		console.log('Player | play');
		this._resetAudio();
		this._currentTrack = this._playlist.getCurrentTrack();
		if (!this._currentTrack) {
			return;
		}
		this._audioJsPlayer.load(this._currentTrack.url);
		this._seekTo(this._currentTrack.position);
	};

	Player.prototype._resetAudio = function () {
		console.log('Player | create audio');
		var self = this;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.$room.find('audio.player').remove();
		this.$room.find('.audiojs').remove();
		this.$player.append('<audio preload class="player"></audio>');
		this._audioJsPlayer = audiojs.createAll({
			trackEnded: function () {
				self._trackEnded();
			},
			loadError: function() {
				self._errorCount += 1;
				console.error('PLAYER ERROR, cannot load, playing again');
				if (self._errorCount > 20) {
					console.error('PLAYER ERROR, too many errors');
					return;
				}
				self.play();
			},
			updatePlayhead: function(percent) {
				self._currentTrack.position = Math.round(percent * 100) / 100;
			}
		})[0];
	};

	Player.prototype._seekTo = function (position) {
		position = position || 0;
		console.log('Player | seek to %s%', position * 100);
		var self = this;
		var seekStarted = new Date();
		var lastPartialSeek = new Date();
		var lastPartialSeekPosition = 0;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.playIntervalId = setInterval(function () {
			var now = new Date();
			if ((now - seekStarted) > 60000) {
				console.log('PLAYER ERROR, play/seek timeout elapsed, playing again');
				clearInterval(self.playIntervalId);
				self.play();
			}
			if (!self._audioJsPlayer.loadedPercent) {
				return;
			}
			if (self._audioJsPlayer.loadedPercent > position) {
				console.log('Player | seeking to %s%', position * 100);
				clearInterval(self.playIntervalId);
				self._audioJsPlayer.skipTo(position);
				self._audioJsPlayer.play();
			} else {
				var elapsed = now - lastPartialSeek;
				var partialPosition = self._audioJsPlayer.loadedPercent * 0.75;
				if (elapsed > 300 && (partialPosition - lastPartialSeekPosition) > 0.05) {
					lastPartialSeekPosition = partialPosition;
					console.log('Player | partial seek to %s%', partialPosition * 100);
					self._audioJsPlayer.skipTo(partialPosition);
					lastPartialSeek = now;
				}
			}
		}, 100);
	};

	Player.prototype._trackEnded = function () {
		console.log('Player | track ended');
		if (this._playlist.next()) {
			this.play();
		}
	};

	Player.prototype.getPlayerState = function () {
		var playerStatus = 'Buffering...';
		var duration = 0;
		var elapsed = 0;
		if (this._audioJsPlayer) {
			if (this._audioJsPlayer.playing) {
				playerStatus = 'Playing';
			}
			duration = this._audioJsPlayer.duration;
			if (this._audioJsPlayer.source) {
				elapsed = this._audioJsPlayer.source.currentTime;
			}
		}
		return {
			status: playerStatus,
			duration: Math.round(duration),
			elapsed: Math.round(elapsed)
		};
	};

	return Player;

});
