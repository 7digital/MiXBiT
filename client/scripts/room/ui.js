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
		this.$currentTrackList = this.$room.find('.current-track ul');
		this.$currentTrackPosition = this.$room.find('.current-track .track-position');
		this.$nextTrackList = this.$room.find('.next-track ul');
		this.$trackQueue = this.$room.find('.track-queue ul');
	}

	Ui.prototype.setRoomState = function (roomState) {
		this._roomTitle = roomState.name;
		this._roomGenre = roomState.genre;
	};

	Ui.prototype.setPlaylist = function (playlist) {
		console.log('Ui | set playlist');
		this.playlist = playlist;
	};

	Ui.prototype.connected = function () {
		console.log('Ui | connected');
		this.$roomLoadingStatus.text('Syncing with server...');
	};

	Ui.prototype.update = function () {
		console.log('UI | update');
		if (this.isLoading) {
			this._hideLoading();
		}
		this._renderRoomInfo();
		this._renderTrackHistory();
		this._renderPreviousTrack();
		this._renderCurrentTrack();
		this._renderNextTrack();
		this._renderTrackQueue();
	};

	Ui.prototype._hideLoading = function () {
		console.log('Ui | hide loading');
		this.$room.removeClass('loading');
		this.$roomLoading.addClass('hidden');
		this.isLoading = false;
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
		self.$trackHistory.empty();
		_.each(trackHistory.slice(1), function (track) {
			self.$trackHistory.append(self._formatTrackAsListItem(track));
		});
	};

	Ui.prototype._renderPreviousTrack = function () {
		console.log('UI | render previous track');
		var track = this.playlist._trackHistory[0];
		var trackDetails = '<li>no previous track</li>';
		if (track) {
			trackDetails = this._formatTrackAsListItems(track);
		}
		this.$previousTrackList.empty();
		this.$previousTrackList.append(trackDetails);
	};

	Ui.prototype._renderCurrentTrack = function () {
		console.log('UI | render current track');
		var track = this.playlist.getCurrentTrack();
		var trackDetails = '<li>no track to play</li>';
		var trackPosition = 0;
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
		var track = this.playlist._trackQueue[0];
		var trackDetails = '<li>no next track</li>';
		if (track) {
			trackDetails = this._formatTrackAsListItems(track);
		}
		this.$nextTrackList.empty();
		this.$nextTrackList.append(trackDetails);
	};

	Ui.prototype._renderTrackQueue = function () {
		console.log('UI | render track queue');
		var self = this;
		var trackQueue = this.playlist.getTrackQueue();
		self.$trackQueue.empty();
		_.forEach(trackQueue.slice(1), function (track) {
			self.$trackQueue.append('<li>' + self._formatTrackAsListItem(track) + '</li>');
		});
	};

	return Ui;

});
