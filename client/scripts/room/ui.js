define([
	'lodash',
	'jquery'
], function (_, $) {
	'use strict';

	function Ui(skipCallBack) {
		console.log('UI | init');
		this.$room = $('.room');
		this.$roomLoading = $('.room-loading');
		this.$roomLoadingStatus = this.$roomLoading.find('.status');
		this.$roomTitle = this.$room.find('.room-info-title a');
		this.$roomGenre = this.$room.find('.room-info-genre');
		// this.$trackHistory = this.$room.find('.track-history ul'); // REMOVE
		this.$previousTrack = this.$room.find('.player-track-previous');
		this.$currentTrack = this.$room.find('.player-track-current');
		// this.$currentTrackPosition = this.$room.find('.current-track .track-position'); // REMOVE
		this.$nextTrack = this.$room.find('.player-track-next');
		// this.$trackQueue = this.$room.find('.track-queue ul'); // REMOVE
		this.$playerStatus = this.$room.find('.debug .player-status');
		this.$playerElapsed = this.$room.find('.debug .player-elapsed');
		this.$playerDuration = this.$room.find('.debug .player-duration');
		this.$skipCallback = this.$room.find('.debug .player-skip');
		this.$skipCallback.click(skipCallBack);
		this._lastUiStatus = {};
	}

	Ui.prototype.setIo = function (io) {
		console.log('Ui | set io');
		this.io = io;
	};

	Ui.prototype.setPlaylist = function (playlist) {
		console.log('Ui | set playlist');
		this.playlist = playlist;
	};

	Ui.prototype.setPlayer = function (player) {
		console.log('Ui | set player');
		this.player = player;
	};

	Ui.prototype.setRoomState = function (roomState) {
		console.log('Ui | set room state');
		this._roomTitle = roomState.name;
		this._roomGenre = roomState.genre;
	};

	Ui.prototype.trackChanges = function () {
		console.log('UI | track changes');
		var self = this;
		setInterval(function () {
			self._update();
		}, 100);
	};

	Ui.prototype._update = function () {
		this._renderLoadingStatus();
		this._renderRoomInfo();
		// this._renderTrackHistory();
		this._renderPreviousTrack();
		this._renderCurrentTrack();
		this._renderNextTrack();
		// this._renderTrackQueue();
		this._renderPlayer();
	};

	Ui.prototype._renderLoadingStatus = function () {
		var updated = false;
		var isConnected = this.io.isConnected();
		var hasSynced = this.io.hasSynched();
		if (!isConnected && !hasSynced) {
			if (this._isDirty('isConnected', isConnected)) {
				this.$roomLoadingStatus.text('Connecting to server...');
				updated = true;
			}
		}
		if (isConnected && !hasSynced) {
			if (this._isDirty('hasSynced', hasSynced)) {
				this.$roomLoadingStatus.text('Syncing with server...');
				updated = true;
			}
		}
		if (isConnected && hasSynced) {
			if (this._isDirty('isLoaded', true)) {
				this.$room.removeClass('is-loading');
				this.$roomLoading.addClass('is-hidden');
				updated = true;
			}
		}
		if (updated) {
			console.log('Ui | render loading status');
		}
	};

	Ui.prototype._renderRoomInfo = function () {
		var updated = false;
		if (this._isDirty('roomTitle', this._roomTitle)) {
			this.$roomTitle.text(this._roomTitle || 'NO ROOM TITLE');
			updated = true;
		}
		if (this._isDirty('roomGenre', this._roomGenre)) {
			this.$roomGenre.text(this._roomGenre || 'NO ROOM GENRE');
			updated = true;
		}
		if (updated) {
			console.log('UI | render room info');
		}
	};

	Ui.prototype._formatTrackDetailsShort = function (track) {
		if (!track) {
			return null;
		}
		return track.artist + ' - ' + track.title;
	};

//	Ui.prototype._renderTrackHistory = function () {
//		var self = this;
//		var trackHistory = this.playlist.getTrackHistory();
//		if (!_.isEqual(this._lastUiStatus.trackHistory, trackHistory)) {
//			this._lastUiStatus.trackHistory = _.cloneDeep(trackHistory);
//			this.$trackHistory.empty();
//			if (trackHistory && trackHistory.length) {
//				_.each(trackHistory.slice(1), function (track) {
//					self.$trackHistory.append(self._formatTrackDetailsShort(track));
//				});
//			}
//			console.log('UI | render track history');
//		}
//	};

	Ui.prototype._isDirty = function (fieldName, currentValue) {
		currentValue = currentValue || null;
		if (!_.isEqual(this._lastUiStatus[fieldName], currentValue)) {
			this._lastUiStatus[fieldName] = _.cloneDeep(currentValue);
			return true;
		} else {
			return false;
		}
	};

	Ui.prototype._renderTrack = function (track, fieldName, $element) {
		this['_' + fieldName] = track;
		var trackDetails = 'no track';
		var trackImage = '/images/packshot-placeholder.png';
		if (this._isDirty(fieldName, track)) {
			if (track) {
				trackDetails = this._formatTrackDetailsShort(track);
				trackImage = track.image;
			}
			$element.find('.track-title').text(trackDetails);
			$element.find('.track-packshot').attr('src', trackImage);
			console.log('UI | render', fieldName);
		}
	};

	Ui.prototype._renderPreviousTrack = function () {
		var previousTrack;
		var trackHistory = this.playlist.getTrackHistory();
		if (trackHistory && trackHistory.length) {
			previousTrack = trackHistory[0];
		}
		this._renderTrack(previousTrack, 'previousTrack', this.$previousTrack);
	};

	Ui.prototype._renderCurrentTrack = function () {
		var currentTrack = this.playlist.getCurrentTrack();
		this._renderTrack(currentTrack, 'currentTrack', this.$currentTrack);
	};

	Ui.prototype._renderNextTrack = function () {
		var nextTrack;
		var trackQueue = this.playlist.getTrackQueue();
		if (trackQueue && trackQueue.length) {
			nextTrack = trackQueue[0];
		}
		this._renderTrack(nextTrack, 'nextTrack', this.$nextTrack);
	};

//	Ui.prototype._renderTrackQueue = function () {
//		var self = this;
//		var trackQueue = this.playlist.getTrackQueue();
//		if (!_.isEqual(this._lastUiStatus.trackQueue, trackQueue)) {
//			this._lastUiStatus.trackQueue = _.cloneDeep(trackQueue);
//			self.$trackQueue.empty();
//			if (trackQueue && trackQueue.length) {
//				_.forEach(trackQueue.slice(1), function (track) {
//					self.$trackQueue.append('<li>' + self._formatTrackDetailsShort(track) + '</li>');
//				});
//			}
//			console.log('UI | render track queue');
//		}
//	};

	Ui.prototype._renderPlayer = function () {
		var playerState = this.player.getPlayerState();
		if (this._isDirty('playerState', playerState)) {
			var playerStatus = 'Loading...';
			var playerElapsed = 0;
			var playerDuration = 0;
			if (playerState) {
				playerStatus = playerState.status;
				playerElapsed = playerState.elapsed;
				playerDuration = playerState.duration;
			}
			this.$playerStatus.text(playerStatus);
			this.$playerElapsed.text(this._toHHMMSS(playerElapsed));
			this.$playerDuration.text(this._toHHMMSS(playerDuration));
			// console.log('UI | render player status');
		}
	};

	Ui.prototype._toHHMMSS = function (value) {
		var sec_num = parseInt(value, 10);
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);
		if (hours   < 10) {hours   = "0" + hours;}
		if (minutes < 10) {minutes = "0" + minutes;}
		if (seconds < 10) {seconds = "0" + seconds;}
		return hours + ':' + minutes + ':' + seconds;
	};

	return Ui;

});
