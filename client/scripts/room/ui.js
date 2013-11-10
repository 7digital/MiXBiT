define([
	'lodash',
	'jquery'
], function (_, $) {
	'use strict';

	function Ui() {
		console.log('UI | init');
		this.isLoading = true;
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
	}

	Ui.prototype.setIo = function (io) {
		console.log('Ui | set io');
		this.io = io;
	}

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
		this._renderTrackHistory();
		this._renderPreviousTrack();
		this._renderCurrentTrack();
		this._renderNextTrack();
		this._renderTrackQueue();
		this._renderPlayer();
	};

	Ui.prototype._renderLoadingStatus = function () {
		console.log('Ui | render loading status');
		if (!this.io.isConnected()) {
			this.$roomLoadingStatus.text('Connecting to server...');
		} else	if (!this.io.hasSynched()) {
			this.$roomLoadingStatus.text('Syncing with server...');
		} else {
			this.$room.removeClass('loading');
			this.$roomLoading.addClass('hidden');
		}
	};

	Ui.prototype._renderRoomInfo = function () {
		console.log('UI | render room info');
		this.$roomTitle.text(this._roomTitle || 'NO ROOM TITLE');
		this.$roomGenre.text(this._roomGenre || 'NO ROOM GENRE');
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
