define([
	'lodash',
	'audiojs' // Eventually try mediaelementjs or howler.js
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
		var serverPosition;
		console.log('Player | play');
		this._resetAudio();
		this._currentTrack = this._playlist.getCurrentTrack();
		if (!this._currentTrack) {
			return;
		}
		// Consider using https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video#Specifying_playback_range
		serverPosition = this._getServerTrackPosition();
		// If the son is nearly finished, do skip it.
		// 0.98% on a 5min song means that there are less than 6 seconds before the end.
		if (serverPosition >= 0.98) {
			console.log('Player | play | moving to next');
			if (this._playlist.next()) {
				this.play();
				return;
			}
		}
		this._audioJsPlayer.load(this._currentTrack.url);
		this._seekTo(serverPosition);
	};

	Player.prototype._getServerTrackPosition = function () {
		var position;
		console.log('Player | set current track position');
		var positionOffset = Math.round((Date.now() - this._currentTrack.startTime) / 1000);
		position = ((positionOffset * 100) / this._currentTrack.duration) / 100;
		// check if the track playtime is already elapsed
		if (position > 1) {
			console.log('Player | get server track position | elapsed');
			this._currentTrack.position = 1;
		}
		return position;
	};

	Player.prototype._resetAudio = function () {
		console.log('Player | reset audio');
		var self = this;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.$room.find('audio.player').remove();
		this.$room.find('.audiojs').remove();
		this.$player.append('<audio preload class="player"></audio>');
		if (this._audioJsPlayer) {
			this._audioJsPlayer.updatePlayhead = function() {};
			delete this._audioJsPlayer;
		}
		this._audioJsPlayer = audiojs.createAll({
			trackEnded: function () {
				self._trackEnded();
			},
			loadError: function() {
				self._errorCount += 1;
				console.error('Player | reset audio | ERROR, cannot load, playing again');
				if (self._errorCount > 20) {
					console.error('Player | reset audio | STOP, too many errors.');
					clearInterval(this.playIntervalId);
					return;
				}
				self.play();
			},
			updatePlayhead: function(percent) {
				self._currentTrack.position = Math.floor(percent * 100) / 100;
			}
		})[0];
	};

	Player.prototype._seekTo = function (position) {
		position = position || 0;
		console.log('Player | seek to %s%', Math.round(position * 100));
		var self = this;
		var lastPartialSeek = Date.now();
		var lastPartiaPosition = 0;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.playIntervalId = setInterval(function () {
			var now = Date.now();
			if ((now - lastPartialSeek) > 30000) {
				console.error('Player | seek to | ERROR, play/seek timeout elapsed, retrying');
				clearInterval(self.playIntervalId);
				self.play();
			}
			if (!self._audioJsPlayer.loadedPercent) {
				return;
			}
			if (self._audioJsPlayer.loadedPercent > position) {
				console.log('Player | seek to | %s%', Math.round(position * 100));
				clearInterval(self.playIntervalId);
				self._audioJsPlayer.skipTo(position);
				self._audioJsPlayer.play();
				self._updateCurrentTrackDuration(self._audioJsPlayer.duration);
			} else {
				var elapsed = now - lastPartialSeek;
				var partialPosition = self._audioJsPlayer.loadedPercent - ((self._audioJsPlayer.loadedPercent - lastPartiaPosition) * 0.5);
				if (elapsed > 300 && (partialPosition - lastPartiaPosition) > 0.01) {
					lastPartiaPosition = partialPosition;
					console.log('Player | seek to | partial to %s%', Math.round(partialPosition * 100));
					self._audioJsPlayer.skipTo(partialPosition);
					lastPartialSeek = now;
				}
			}
		}, 100);
	};

	Player.prototype._updateCurrentTrackDuration = function (duration) {
		duration = Math.round(duration);
		console.log('Player | update current track duration');
		// Here we can set the accepted spread between server and client
		if (Math.abs(this._currentTrack.duration - duration) > 0) {
			console.log('Player | update current track duration | was %ss, updated to %ss',
				this._currentTrack.duration, duration);
			this._currentTrack.duration = duration;
		}
	};

	Player.prototype._trackEnded = function () {
		console.log('Player | track ended');
		this._currentTrack.position = 1;
		if (this._playlist.next()) {
			this.play();
		}
	};

	Player.prototype.getPlayerState = function () {
		var isPlaying = false,
			playerStatus = 'Buffering...',
			duration = 0,
			elapsed = 0;
		if (this._audioJsPlayer) {
			if (this._audioJsPlayer.playing) {
				playerStatus = 'Playing';
				isPlaying = true;
			}
			duration = this._audioJsPlayer.duration;
			if (this._audioJsPlayer.source) {
				elapsed = this._audioJsPlayer.source.currentTime;
			}
		}
		return {
			isPlaying: isPlaying,
			status: playerStatus,
			duration: Math.round(duration),
			elapsed: Math.round(elapsed)
		};
	};

	return Player;

});
