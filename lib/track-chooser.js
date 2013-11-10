var OAuth = require('oauth').OAuth;
var util = require('util');
var config = require('./config');
var async = require('async');
var api = require('7digital-api').configure({
	consumerkey: config.consumerKey,
	consumersecret: config.consumerSecret
});

function createTrackChooser(trackIndex, cb) {
	return function chooseTrack(err, res) {
		var track, actualTrack;

		if (err) {
			return cb(err);
		}

		if (!res || !res.response || !res.response.tracks
			|| !res.response.tracks[0].track) {
				console.log(res.response);
			return cb(new Error("Error getting tracks"));
		}

		actualTrack = res.response.tracks[0].track[trackIndex];

		track = {
			trackId: actualTrack.id,
			artistName: actualTrack.artist[0].name[0],
			releaseName: actualTrack.release[0].title[0],
			image: actualTrack.release[0].image[0].replace(/_50.jpg$/, '_350.jpg'),
			trackName:	actualTrack.title[0],
			duration: actualTrack.duration[0]
		}

		return cb(null, track);
	};
}

function getGenreTracks(genre, callback) {
	var releases = new api.Releases(),
		page = /*Math.floor(Math.random() * 4)*/1;
	var genreMap = {
		'Techno': 'techno',
		'Rock': 'rock',
		'Disco': 'disco',
		'Hip-Hop': 'hip-hop-rap'
	};

	releases.getTopByTags({ tags: genreMap[genre], page: page }, function getTrackFromRelease(err, res) {
		var tracks, room;

		if (err) {
			return callback(err);
		}

		if (!res || !res.response || !res.response.taggedResults
			|| !res.response.taggedResults[0].taggedItem) {
				console.log(res.response);
			return callback(new Error("Error getting tagged results"));
		}

		async.map(res.response.taggedResults[0].taggedItem, function (release, cb) {
			var actualRelease = release.release[0];
			var chosenTrack = Math.floor(Math.random() * actualRelease.trackCount);

			releases.getTracks({
				releaseId: actualRelease.id
			}, createTrackChooser(chosenTrack, cb));

		}, callback);
	});
}

function createSignedStreamUrl(trackId, socketId) {
	var url = util.format(
		'http://stream.svc.7digital.net/stream/catalogue?userId=%s&formatId=1&trackId=%s',
		socketId,
		trackId);
	var oAuth = new OAuth(
				'http://api.7digital.com/1.2/oauth/requesttoken',
				'http://api.7digital.com/1.2/oauth/accesstoken',
				config.consumerKey, config.consumerSecret, '1.0',
				null, 'HMAC-SHA1');

	oAuth.setClientOptions({
		requestTokenHttpMethod: "GET",
		accessTokenHttpMethod: "GET"
	});

	return oAuth.signUrl(url);
}

module.exports = {
	getTracks: getGenreTracks,
	getTrackUrl: createSignedStreamUrl
};
