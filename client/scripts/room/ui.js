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
		this.$roomTitle = this.$room.find('.room-title a');
		this.$roomGenre = this.$room.find('.room-genre');
		this.$trackHistory = this.$room.find('.track-history ul');
		this.$previousTrackList = this.$room.find('.previous-track ul');
		this.$playerStatus = this.$room.find('.player-status');
		this.$currentTrackList = this.$room.find('.current-track ul');
		this.$currentTrackPosition = this.$room.find('.current-track .track-position');
		this.$nextTrackList = this.$room.find('.next-track ul');
		this.$trackQueue = this.$room.find('.track-queue ul');
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
		this._renderLoadingStatus(); // dirty flag
		this._renderRoomInfo(); // dirty flag
		this._renderTrackHistory();
		this._renderPreviousTrack();
		this._renderCurrentTrack();
		this._renderNextTrack();
		this._renderTrackQueue();
		this._renderPlayer();
	};

	Ui.prototype._renderLoadingStatus = function () {
		var updated = false;
		var isConnected = this.io.isConnected();
		var hasSynced = this.io.hasSynched();
		if (!isConnected && !hasSynced) {
			if (this._lastUiStatus.isConnected !== isConnected) {
				this.$roomLoadingStatus.text('Connecting to server...');
				this._lastUiStatus.isConnected = isConnected;
				updated = true;
			}
		}
		if (isConnected && !hasSynced) {
			if (this._lastUiStatus.hasSynched !== hasSynced) {
				this.$roomLoadingStatus.text('Syncing with server...');
				this._lastUiStatus.hasSynched = hasSynced;
				updated = true;
			}
		}
		if (isConnected && hasSynced) {
			if (!this._lastUiStatus.isLoaded) {
				this.$room.removeClass('loading');
				this.$roomLoading.addClass('hidden');
				this._lastUiStatus.isLoaded = true;
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
			this.$roomTitle.text(this._roomTitle || 'NO ROOM TITLE');
			this._lastUiStatus.roomTitle = this._roomTitle;
			updated = true;
		}
		if (this._lastUiStatus.roomGenre !== this._roomGenre) {
			this.$roomGenre.text(this._roomGenre || 'NO ROOM GENRE');
			this._lastUiStatus.roomGenre = this._roomGenre;
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

	Ui.prototype._formatTrackAsListItem = function (track) {
		if (!track) {
			return null;
		}
		return '<li>' + track.artist + ' - ' + track.title + "</li>";
	};

	Ui.prototype._renderTrackHistory = function () {
		console.log('UI | render track history');
		var self = this;
		var trackHistory = this.playlist.getTrackHistory();
		this.$trackHistory.empty();
		if (trackHistory && trackHistory.length) {
			_.each(trackHistory.slice(1), function (track) {
				self.$trackHistory.append(self._formatTrackAsListItem(track));
			});
		}
	};

	Ui.prototype._renderPreviousTrack = function () {
		console.log('UI | render previous track');
		var trackDetails = '<li>no previous track</li>';
		var trackHistory = this.playlist.getTrackHistory();
		if (trackHistory && trackHistory.length) {
			trackDetails = this._formatTrackAsListItems(trackHistory[0]);
		}
		this.$previousTrackList.empty();
		this.$previousTrackList.append(trackDetails);
	};

	Ui.prototype._renderCurrentTrack = function () {
		console.log('UI | render current track');
		var trackDetails = '<li>no track to play</li>';
		var trackPosition = 0;
		var track = this.playlist.getCurrentTrack();
		if (track) {
			trackDetails = this._formatTrackAsListItems(track);
			trackPosition = (track.position * 100) + '%';
		}
		this.$currentTrackList.empty();
		this.$currentTrackList.append(trackDetails);
		this.$currentTrackPosition.text(trackPosition);
	};

	Ui.prototype._renderNextTrack = function () {
		console.log('UI | render next track');
		var trackQueue = this.playlist.getTrackQueue();
		var trackDetails = '<li>no next track</li>';
		if (trackQueue && trackQueue.length) {
			trackDetails = this._formatTrackAsListItems(trackQueue[0]);
		}
		this.$nextTrackList.empty();
		this.$nextTrackList.append(trackDetails);
	};

	Ui.prototype._renderTrackQueue = function () {
		console.log('UI | render track queue');
		var self = this;
		var trackQueue = this.playlist.getTrackQueue();
		self.$trackQueue.empty();
		if (trackQueue && trackQueue.length) {
			_.forEach(trackQueue.slice(1), function (track) {
				self.$trackQueue.append('<li>' + self._formatTrackAsListItem(track) + '</li>');
			});
		}
	};

	Ui.prototype._renderPlayer = function () {
		console.log('UI | render player');
		this.$playerStatus.text(this.player.getPlayerStatus().status);
	};

	return Ui;

});
