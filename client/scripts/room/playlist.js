define([
	'lodash'
], function (_) {
	'use strict';

	function Playlist() {
		console.log('Playlist | init');
	}

	Playlist.prototype.loadFromRoomState = function (roomState) {
		console.log('Playlist | set from room state');
		this._trackHistory = _.map((roomState.history || []).reverse(), this._convert, this);
		this._currentTrack = this._convert(roomState.current);
		this._trackQueue = _.map(roomState.queue || [], this._convert, this);
		if (this._currentTrack) {
			this._currentTrack.position = 0.9;
		}
	};

	Playlist.prototype._convert = function (externalTrack) {
		if (!externalTrack) {
			return null;
		}
		return {
			artist: externalTrack.artistName || 'NO ARTIST',
			title: externalTrack.title || 'NO TITLE',
			album: externalTrack.releaseName || 'NO ALBUM',
			url: externalTrack.url || 'NO URL'
		};
	};

	Playlist.prototype.next = function () {
		console.log('Playlist | next');
		this._trackHistory.unshift(this._currentTrack);
		if (!this._trackQueue.length){
			this._currentTrack = null;
			return false;
		}
		this._currentTrack = this._trackQueue[0];
		this._currentTrack.position = 0.9;
		this._trackQueue.splice(0, 1);
		return true;
	};

	Playlist.prototype.getTrackHistory = function () {
		// console.log('Playlist | track history');
		return this._trackHistory;
	};

	Playlist.prototype.getCurrentTrack = function () {
		// console.log('Playlist | current track');
		return this._currentTrack;
	};

	Playlist.prototype.getTrackQueue = function () {
		// console.log('Playlist | track queue');
		return this._trackQueue;
	};

	return Playlist;

});
