define([
	'lodash'
], function (_) {
	'use strict';

	function Playlist() {

	}

	Playlist.prototype.trackHistory = function () {
		console.log('Playlist | track history');
		return [
			'http://s3.amazonaws.com/audiojs/01-dead-wrong-intro.mp3',
			'http://s3.amazonaws.com/audiojs/02-juicy-r.mp3',
			'http://s3.amazonaws.com/audiojs/03-its-all-about-the-crystalizabeths.mp3'
		];
	};

	Playlist.prototype.currentTrack = function () {
		console.log('Playlist | current track');
		return {
			url: 'http://s3.amazonaws.com/audiojs/04-islands-is-the-limit.mp3',
			position: 0.3
		};
	};

	Playlist.prototype.nextTrack = function () {
		console.log('Playlist | next track');
		return this.trackQueue()[0];
	};

	Playlist.prototype.trackQueue = function () {
		console.log('Playlist | track queue');
		return [
			'http://s3.amazonaws.com/audiojs/05-one-more-chance-for-a-heart-to-skip-a-beat.mp3',
			'http://s3.amazonaws.com/audiojs/06-suicidal-fantasy.mp3',
			'http://s3.amazonaws.com/audiojs/07-everyday-shelter.mp3',
			'http://s3.amazonaws.com/audiojs/08-basic-hypnosis.mp3',
			'http://s3.amazonaws.com/audiojs/09-infinite-victory.mp3',
			'http://s3.amazonaws.com/audiojs/10-the-curious-incident-of-big-poppa-in-the-nighttime.mp3',
			'http://s3.amazonaws.com/audiojs/11-mo-stars-mo-problems.mp3'
		];
	};

	return Playlist;

});
