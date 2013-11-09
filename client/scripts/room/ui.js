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
		this.$roomTitle = this.$room.find('.room-title');
		this.$trackHistory = this.$room.find('.track-history ul');
		this.$previousTrackTitle = this.$room.find('.previous-track .track-title');
		this.$currentTrackTitle = this.$room.find('.current-track .track-title');
		this.$currentTrackPosition = this.$room.find('.current-track .track-position');
		this.$nextTrackTitle = this.$room.find('.next-track .track-title');
		this.$trackQueue = this.$room.find('.track-queue ul');
	}

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
		this.$roomTitle.text('ROOM TITLE');
	};

	Ui.prototype._formatTrack = function (track) {
		return '<span title="' + track.url + '">' + track.artist + ' - ' + track.title + "</span>";
	}

	Ui.prototype._renderTrackHistory = function () {
		console.log('UI | render track history');
		var self = this;
		var trackHistory = this.playlist.getTrackHistory();
		self.$trackHistory.empty();
		_.each(trackHistory.slice(1), function (track) {
			self.$trackHistory.append('<li>' + self._formatTrack(track) + '</li>');
		});
	};

	Ui.prototype._renderPreviousTrack = function () {
		console.log('UI | render previous track');
		var track = this.playlist._trackHistory[0];
		var trackTitle = 'no previous track';
		if (track) {
			trackTitle = this._formatTrack(track);
		}
		this.$previousTrackTitle.html(trackTitle);
	};

	Ui.prototype._renderCurrentTrack = function () {
		console.log('UI | render current track');
		var track = this.playlist.getCurrentTrack();
		var trackTitle = 'no track to play';
		var trackPosition = 0;
		if (track) {
			trackTitle = this._formatTrack(track);
			trackPosition = (track.position * 100) + '%';
		}
		this.$currentTrackTitle.html(trackTitle);
		this.$currentTrackPosition.text(trackPosition);
	};

	Ui.prototype._renderNextTrack = function () {
		console.log('UI | render next track');
		var track = this.playlist._trackQueue[0];
		var trackTitle = 'no next track';
		if (track) {
			trackTitle = this._formatTrack(track);
		}
		this.$nextTrackTitle.html(trackTitle);
	};

	Ui.prototype._renderTrackQueue = function () {
		console.log('UI | render track queue');
		var self = this;
		var trackQueue = this.playlist.getTrackQueue();
		self.$trackQueue.empty();
		_.forEach(trackQueue.slice(1), function (track) {
			self.$trackQueue.append('<li>' + self._formatTrack(track) + '</li>');
		});
	};

	return Ui;

});
