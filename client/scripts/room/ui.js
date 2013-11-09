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
	}

	Ui.prototype.connected = function () {
		console.log('Ui | connected');
		this.$roomLoadingStatus.text('Syncing with server...');
	};

	Ui.prototype.hideLoading = function () {
		console.log('Ui | hide loading');
		this.$room.removeClass('loading');
		this.$roomLoading.addClass('hidden');
		this.isLoading = false;
	};

	Ui.prototype.update = function () {
		console.log('UI | update');
		if (this.isLoading) {
			this.hideLoading();
		}
		this.renderRoomInfo();
		this.renderTrackHistory();
		this.renderCurrentTrack();
		this.renderTrackQueue();
	};

	Ui.prototype.renderRoomInfo = function () {
		console.log('UI | render room info');
		this.$roomTitle.text('ROOM TITLE');
	};

	Ui.prototype.renderTrackHistory = function () {
		console.log('UI | render track history');
		var self = this;
		var trackHistory = this.playlist.getTrackHistory();
		self.$trackHistory.empty();
		_.eachRight(trackHistory, function (track) {
			self.$trackHistory.append('<li>' + track + '</li>');
		});
	};

	Ui.prototype.renderCurrentTrack = function () {
		console.log('UI | render current track');
		var currentTrack = this.playlist.getCurrentTrack();
		var trackTitle = 'no songs to play';
		var trackPosition = 0;
		if (currentTrack) {
			trackTitle = currentTrack.url;
			trackPosition = (currentTrack.position * 100) + '%';
		}
		this.$currentTrackTitle.text(trackTitle);
		this.$currentTrackPosition.text(trackPosition);
	};

	Ui.prototype.renderTrackQueue = function () {
		console.log('UI | render track queue');
		var self = this;
		var trackQueue = this.playlist.getTrackQueue();
		self.$trackQueue.empty();
		_.forEach(trackQueue, function (track) {
			self.$trackQueue.append('<li>' + track + '</li>');
		});
	};

	return Ui;

});
