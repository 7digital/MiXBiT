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
		if (!this._currentTrack && this._trackQueue.length) {
			this.next();
		}
	};

	Playlist.prototype._convert = function (externalTrack) {
		if (!externalTrack) {
			return null;
		}
		return {
			artist: externalTrack.artistName || 'NO ARTIST',
			title: externalTrack.trackName || 'NO TITLE',
			album: externalTrack.releaseName || 'NO ALBUM',
			url: externalTrack.url || 'NO URL',
			position: 0.9
		};
	};

	Playlist.prototype.next = function () {
		console.log('Playlist | next');
		if (this._currentTrack) {
			this._trackHistory.unshift(this._currentTrack);
		}
		if (!this._trackQueue.length){
			this._currentTrack = null;
			return false;
		}
		this._currentTrack = this._trackQueue[0];
		this._trackQueue.splice(0, 1);
		return true;
	};

	Playlist.prototype.getTrackHistory = function () {
		return this._trackHistory;
	};

	Playlist.prototype.getCurrentTrack = function () {
		return this._currentTrack;
	};

	Playlist.prototype.getTrackQueue = function () {
		return this._trackQueue;
	};

	return Playlist;

});
