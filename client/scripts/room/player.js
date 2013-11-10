define([
	'lodash',
	'audiojs'
], function (_, audiojs) {
	'use strict';

	function Player(stateChangedCallback, $room) {
		console.log('Player | init');
		this._stateChangedCallback = stateChangedCallback;
		this.$room = $room;
		this._playlist = null;
		this._currentTrack = null;
	}

	Player.prototype.setPlaylist = function (playlist) {
		console.log('Player | update playlist');
		this._playlist = playlist;
	};

	Player.prototype.play = function () {
		console.log('Player | play');
		this._raiseStateChanged();
		this._resetAudio();
		this._currentTrack = this._playlist.getCurrentTrack();
		if (!this._currentTrack) {
			return;
		}
		this.audioJsPlayer.load(this._currentTrack.url);
		this._seekTo(this._currentTrack.position);
	};

	Player.prototype.getStatus = function () {
		return this.audioJsPlayer.state;
	};

	Player.prototype._resetAudio = function () {
		console.log('Player | create audio');
		var self = this;
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.$room.find('audio.player').remove();
		this.$room.find('.audiojs').remove();
		this.$room.find('.current-track').append('<audio preload class="player"></audio>');
		this.audioJsPlayer = audiojs.createAll({
			trackEnded: function () {
				self._trackEnded();
			},
			loadError: function() {
				console.error('PLAYER ERROR, cannot load, playing again');
				self.play();
			}
		})[0];
	};

	Player.prototype._seekTo = function (position) {
		position = position || 0;
		console.log('Player | seek to %s%', position * 100);
		var self = this;
		var seekStarted = new Date();
		var lastPartialSeek = new Date();
		var lastPartialSeekPosition = new Date();
		if (this.playIntervalId) {
			clearInterval(this.playIntervalId);
		}
		this.playIntervalId = setInterval(function () {
			var now = new Date();
			if ((now - seekStarted) > 60000) {
				console.log('PLAYER ERROR, play/seek timeout elapsed, playing again');
				clearInterval(this.playIntervalId);
				self.play();
			}
			if (!self.audioJsPlayer.loadedPercent) {
				return;
			}
			if (self.audioJsPlayer.loadedPercent > position) {
				console.log('Player | seeking to %s%', position * 100);
				clearInterval(self.playIntervalId);
				self.audioJsPlayer.play();
				self.audioJsPlayer.skipTo(position);
				self._raiseStateChanged();
			} else {
				var elapsed = now - lastPartialSeek;
				if (elapsed > 300) {
					var partialPosition = self.audioJsPlayer.loadedPercent * 0.75;
					console.log('Player | partial seek to %s%', partialPosition * 100);
					self.audioJsPlayer.skipTo(partialPosition);
					lastPartialSeek = now;
				}
			}
		}, 100);
	};

	Player.prototype._trackEnded = function () {
		console.log('Player | track ended');
		if (this._playlist.next()) {
			this.play();
		} else {
			this._raiseStateChanged();
		}
	};

	Player.prototype._raiseStateChanged = function () {
		var playerStatus = 'Buffering';
		if (this.audioJsPlayer && this.audioJsPlayer.playing) {
			playerStatus = 'Playing';
		}
		this._stateChangedCallback({
			status : playerStatus
		});
	};

	return Player;

});
