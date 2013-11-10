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
		this._renderLoadingStatus(); // dirty checking
		this._renderRoomInfo(); // dirty checking
		this._renderTrackHistory(); // dirty checking
		this._renderPreviousTrack(); // dirty checking
		this._renderCurrentTrack(); // dirty checking
		this._renderNextTrack(); // dirty checking
		this._renderTrackQueue(); // dirty checking
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
				this.$room.removeClass('loading');
				this.$roomLoading.addClass('hidden');
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

	Ui.prototype._formatTrackAsListItem = function (track) {
		if (!track) {
			return null;
		}
		return '<li>' + track.artist + ' - ' + track.title + "</li>";
	};

	Ui.prototype._renderTrackHistory = function () {
		var self = this;
		var trackHistory = this.playlist.getTrackHistory();
		if (!_.isEqual(this._lastUiStatus.trackHistory, trackHistory)) {
			this._lastUiStatus.trackHistory = _.cloneDeep(trackHistory);
			this.$trackHistory.empty();
			if (trackHistory && trackHistory.length) {
				_.each(trackHistory.slice(1), function (track) {
					self.$trackHistory.append(self._formatTrackAsListItem(track));
				});
			}
			console.log('UI | render track history');
		}
	};

	Ui.prototype._renderPreviousTrack = function () {
		var previousTrack = null;
		var trackHistory = this.playlist.getTrackHistory();
		if (trackHistory && trackHistory.length) {
			previousTrack = trackHistory[0];
		}
		if (!_.isEqual(this._lastUiStatus.previousTrack, previousTrack)) {
			this._lastUiStatus.previousTrack = _.cloneDeep(previousTrack);
			var trackDetails = '<li>no previous track</li>';
			if (previousTrack) {
				trackDetails = this._formatTrackAsListItems(trackHistory[0]);
			}
			this.$previousTrackList.empty();
			this.$previousTrackList.append(trackDetails);
			console.log('UI | render previous track');
		}
	};

	Ui.prototype._renderCurrentTrack = function () {
		var trackDetails = '<li>no track to play</li>';
		var trackPosition = 0;
		var currentTrack = this.playlist.getCurrentTrack();
		if (!_.isEqual(this._lastUiStatus.currentTrack, currentTrack)) {
			this._lastUiStatus.currentTrack = _.cloneDeep(currentTrack);
			if (currentTrack) {
				trackDetails = this._formatTrackAsListItems(currentTrack);
				trackPosition = (currentTrack.position * 100) + '%';
			}
			this.$currentTrackList.empty();
			this.$currentTrackList.append(trackDetails);
			this.$currentTrackPosition.text(trackPosition);
			console.log('UI | render current track');
		}
	};

	Ui.prototype._renderNextTrack = function () {

		var nextTrack = null;
		var trackQueue = this.playlist.getTrackQueue();
		var trackDetails = '<li>no next track</li>';
		if (trackQueue && trackQueue.length) {
			nextTrack = trackQueue[0];
		}
		if (!_.isEqual(this._lastUiStatus.nextTrack, nextTrack)) {
			this._lastUiStatus.nextTrack = _.cloneDeep(nextTrack);
			if (nextTrack) {
				trackDetails = this._formatTrackAsListItems(nextTrack);
			}
			this.$nextTrackList.empty();
			this.$nextTrackList.append(trackDetails);
			console.log('UI | render next track');
		}
	};

	Ui.prototype._renderTrackQueue = function () {
		var self = this;
		var trackQueue = this.playlist.getTrackQueue();
		if (!_.isEqual(this._lastUiStatus.trackQueue, trackQueue)) {
			this._lastUiStatus.trackQueue = _.cloneDeep(trackQueue);
			self.$trackQueue.empty();
			if (trackQueue && trackQueue.length) {
				_.forEach(trackQueue.slice(1), function (track) {
					self.$trackQueue.append('<li>' + self._formatTrackAsListItem(track) + '</li>');
				});
			}
			console.log('UI | render track queue');
		}
	};

	Ui.prototype._renderPlayer = function () {
		console.log('UI | render player');
		this.$playerStatus.text(this.player.getPlayerStatus().status);
	};

	return Ui;

});
