var config = require('./config');
var async = require('async');
var api = require('7digital-api').configure({
	consumerkey: config.consumerKey,
	consumersecret: config.consumerSecret
});

function getGenreTracks(genre, callback) {
	var releases = new api.Releases(),
		page = 1;
		//page = Math.floor(Math.random() * 4);

	releases.getTopByTags({ tags: genre, page: page }, function getTrackFromRelease(err, res) {
		var tracks, room;

		if (err) {
			return cb(err);
		}

		if (!res || !res.response || !res.response.taggedResults
			|| !res.response.taggedResults[0].taggedItem) {
				console.log(res.response);
			return callback(new Error("Error getting tagged results"));
		}

		async.map(res.response.taggedResults[0].taggedItem, function (release, cb) {
			var actualRelease = release.release[0];
			var chosenTrack = Math.floor(Math.random() * actualRelease.trackCount);

			releases.getTracks({ releaseId: actualRelease.id }, 
							function chooseTrack(err, res) {
				var track, actualTrack;

				if (!res || !res.response || !res.response.tracks
					|| !res.response.tracks[0].track) {
						console.log(res.response);
					return cb(new Error("Error getting tracks"));
				}

				actualTrack = res.response.tracks[0].track[chosenTrack];

				track = {
					artistName: actualTrack.artist[0].name[0],
					releaseName: actualTrack.title[0],
					url: 'http://www.7digital.com/shop/34/release/306427/item/' + actualTrack.id + '/play'
				}

				return cb(null, track);
			});
		}, callback);
	});
}


module.exports = {
	getTracks: getGenreTracks
};