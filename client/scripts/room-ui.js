define([
	'lodash',
	'jquery'
], function (_, $) {
	'use strict';

	function RoomUi(room) {
		console.log('Room UI | init');
		this.room = room;
		this.$room = $('.room');
		this.$trackHistory = this.$room.find('.track-history');
		this.$currentTrackTitle = this.$room.find('.current-track-title');
		this.$currentTrackPosition = this.$room.find('.current-track-position');
		this.$trackQueue = this.$room.find('.track-queue');
	}

	RoomUi.prototype.update = function () {
		console.log('Room UI | update');
		var trackHistory = this.room.getTrackHistory();
		var currentTrack = this.room.getCurrentTrack();
		var trackQueue = this.room.getTrackQueue();
		var self = this;
		_.forEach(trackHistory, function (track) {
			self.$trackHistory.append('<li>' + track + '</li>');
		});
		this.$currentTrackTitle.text(currentTrack.url);
		this.$currentTrackPosition.text(currentTrack.position + 's');
		_.forEach(trackQueue, function (track) {
			self.$trackQueue.append('<li>' + track + '</li>');
		});
	};

	return RoomUi;

});
