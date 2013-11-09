define([
	'lodash'
], function (_) {
	'use strict';

	function Playlist() {
		console.log('Ui | init');
		this._trackHistory = [
			'http://s3.amazonaws.com/audiojs/01-dead-wrong-intro.mp3',
			'http://s3.amazonaws.com/audiojs/02-juicy-r.mp3',
			'http://s3.amazonaws.com/audiojs/03-its-all-about-the-crystalizabeths.mp3'
		];
		this._currentTrack = {
			url: 'http://s3.amazonaws.com/audiojs/04-islands-is-the-limit.mp3',
			position: 0.9
		};
		this._trackQueue = [
			'http://s3.amazonaws.com/audiojs/05-one-more-chance-for-a-heart-to-skip-a-beat.mp3',
			'http://s3.amazonaws.com/audiojs/06-suicidal-fantasy.mp3',
			'http://s3.amazonaws.com/audiojs/07-everyday-shelter.mp3',
			'http://s3.amazonaws.com/audiojs/08-basic-hypnosis.mp3',
			'http://s3.amazonaws.com/audiojs/09-infinite-victory.mp3',
			'http://s3.amazonaws.com/audiojs/10-the-curious-incident-of-big-poppa-in-the-nighttime.mp3',
			'http://s3.amazonaws.com/audiojs/11-mo-stars-mo-problems.mp3'
		];
	}

	Playlist.prototype.getTrackHistory = function () {
		console.log('Playlist | track history');
		return this._trackHistory;
	};

	Playlist.prototype.getCurrentTrack = function () {
		console.log('Playlist | current track');
		return this._currentTrack;
	};

	Playlist.prototype.next = function () {
		console.log('Playlist | next');
		var currentTrackUrl = this._currentTrack.url;
		this._trackHistory.push(currentTrackUrl);
		if (!this._trackQueue.length){
			this._currentTrack = null;
			return false;
		}
		var nextTrackUrl = this._trackQueue[0];
		this._currentTrack = {
			url: nextTrackUrl,
			position: 0.9
		};
		this._trackQueue.splice(0, 1);
		return true;
	};

	Playlist.prototype.getTrackQueue = function () {
		console.log('Playlist | track queue');
		return this._trackQueue;
	};

	return Playlist;

});
