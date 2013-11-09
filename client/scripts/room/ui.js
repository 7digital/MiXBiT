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
		this.$trackHistory = this.$room.find('.track-history');
		this.$currentTrackTitle = this.$room.find('.current-track-title');
		this.$currentTrackPosition = this.$room.find('.current-track-position');
		this.$trackQueue = this.$room.find('.track-queue');
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
		this._renderCurrentTrack();
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
		_.eachRight(trackHistory, function (track) {
			self.$trackHistory.append('<li>' + self._formatTrack(track) + '</li>');
		});
	};

	Ui.prototype._renderCurrentTrack = function () {
		console.log('UI | render current track');
		var track = this.playlist.getCurrentTrack();
		var trackTitle = 'no tracks to play';
		var trackPosition = 0;
		if (track) {
			trackTitle = this._formatTrack(track);
			trackPosition = (track.position * 100) + '%';
		}
		this.$currentTrackTitle.html(trackTitle);
		this.$currentTrackPosition.text(trackPosition);
	};

	Ui.prototype._renderTrackQueue = function () {
		console.log('UI | render track queue');
		var self = this;
		var trackQueue = this.playlist.getTrackQueue();
		self.$trackQueue.empty();
		_.forEach(trackQueue, function (track) {
			self.$trackQueue.append('<li>' + self._formatTrack(track) + '</li>');
		});
	};

	return Ui;

});
