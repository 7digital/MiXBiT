var _ = require('lodash');
var api = require('7digital-api').configure({
	consumerkey: process.env.CONSUMER_KEY,
	consumersecret: process.env.CONSUMER_SECRET
});

function getRoom(roomId, cb) {
	var releases = new api.Releases();
	releases.getTracks({ releaseId: 3064027 }, function (err, res) {
		var tracks, room;

		if (err) {
			return cb(err);
		}

		if (!res || !res.response || !res.response.tracks 
			|| !res.response.tracks[0].track) {
				console.log(res.response);
			return cb(new Error("Error getting tracks"));
		}

		tracks = _.map(res.response.tracks[0].track, function (track) {
			console.log(track.release);
			return {
				artistName: track.artist[0].name[0],
				releaseName: track.release[0].title[0],
				url: 'http://www.7digital.com/shop/34/release/306427/item/track.id/play'
			}
		});

		room = {
			history: _.take(tracks, 3).map(function stripUrl(track) {
				return { artistName: track.artistName, releaseName: track.releaseName };
			}),
			current: tracks[3],
			queue: tracks.slice(4)
		};

		cb(null, room);
	});
}

module.exports = {
	get: getRoom
};
