define([
	'lodash',
	'jquery'
], function (_, $) {
	'use strict';

	function Ui() {
		console.log('UI | init');
		this.$room = $('.room');
		this.$roomLoading = $('.room-loading');
		this.$roomLoadingStatus = this.$roomLoading.find('.status');
		this.$roomTitle = this.$room.find('.room-info-title a');
		this.$roomGenre = this.$room.find('.room-info-genre');
		// this.$trackHistory = this.$room.find('.track-history ul'); // REMOVE
		this.$previousTrackTitle = this.$room.find('.player-track-previous .track-title');
		this.$playerStatus = this.$room.find('.player-status');
		this.$currentTrackTitle = this.$room.find('.player-track-current .track-title');
		// this.$currentTrackPosition = this.$room.find('.current-track .track-position'); // REMOVE
		this.$nextTrackTitle = this.$room.find('.player-track-next .track-title');
		// this.$trackQueue = this.$room.find('.track-queue ul'); // REMOVE
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
			if (this._lastUiStatus.isConnected !== isConnected) {
				this._lastUiStatus.isConnected = isConnected;
				this.$roomLoadingStatus.text('Connecting to server...');
				updated = true;
			}
		}
		if (isConnected && !hasSynced) {
			if (this._lastUiStatus.hasSynched !== hasSynced) {
				this._lastUiStatus.hasSynched = hasSynced;
				this.$roomLoadingStatus.text('Syncing with server...');
				updated = true;
			}
		}
		if (isConnected && hasSynced) {
			if (!this._lastUiStatus.isLoaded) {
				this._lastUiStatus.isLoaded = true;
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
		if (this._lastUiStatus.roomTitle !== this._roomTitle) {
			this._lastUiStatus.roomTitle = this._roomTitle;
			this.$roomTitle.text(this._roomTitle || 'NO ROOM TITLE');
			updated = true;
		}
		if (this._lastUiStatus.roomGenre !== this._roomGenre) {
			this._lastUiStatus.roomGenre = this._roomGenre;
			this.$roomGenre.text(this._roomGenre || 'NO ROOM GENRE');
			updated = true;
		}
		if (updated) {
			console.log('UI | render room info');
		}
	};

	Ui.prototype._formatTrackAsListItems = function (track) {
		if (!track) {
			return null;
		}
		var trackArtistListItem = '<li class="track-artist">' + track.artist + '</li>';
		var trackTitleListItem = '<li class="track-title">' + track.title + '</li>';
		var trackAlbumListItem = '<li class="track-album">' + track.album + '</li>';
		return trackArtistListItem  + trackTitleListItem + trackAlbumListItem;
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

	Ui.prototype._renderTrack = function (track, fieldName, $element) {
		track = track || null;
		var trackDetails = 'no track';
		if (!_.isEqual(this._lastUiStatus[fieldName], track)) {
			this._lastUiStatus[fieldName] = _.cloneDeep(track);
			if (track) {
				trackDetails = this._formatTrackDetailsShort(track);
			}
			$element.text(trackDetails);
			console.log('UI | render', fieldName);
		}
	};

	Ui.prototype._renderPreviousTrack = function () {
		var previousTrack;
		var trackHistory = this.playlist.getTrackHistory();
		if (trackHistory && trackHistory.length) {
			previousTrack = trackHistory[0];
		}
		this._renderTrack(previousTrack, 'previousTrack', this.$previousTrackTitle);
	};

	Ui.prototype._renderCurrentTrack = function () {
		var currentTrack = this.playlist.getCurrentTrack();
		this._renderTrack(currentTrack, 'currentTrack', this.$currentTrackTitle);
	};

	Ui.prototype._renderNextTrack = function () {
		var nextTrack;
		var trackQueue = this.playlist.getTrackQueue();
		if (trackQueue && trackQueue.length) {
			nextTrack = trackQueue[0];
		}
		this._renderTrack(nextTrack, 'nextTrack', this.$nextTrackTitle);
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
		var playerStatus = this.player.getPlayerState().status;
		if (!_.isEqual(this._lastUiStatus.playerStatus, playerStatus)) {
			this._lastUiStatus.playerStatus = _.cloneDeep(playerStatus);
			this.$playerStatus.text(playerStatus);
			console.log('UI | render player status');
		}
	};

	return Ui;

});
