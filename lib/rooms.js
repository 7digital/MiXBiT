var _ = require('lodash');
var util = require('util');
var async = require('async');
var redis = require('redis');
var trackChooser = require('./track-chooser');
var client = redis.createClient();
var api = require('7digital-api').configure({
	consumerkey: process.env.CONSUMER_KEY,
	consumersecret: process.env.CONSUMER_SECRET
});
var queuKeyPattern = 'room:%s:queue';
var queueRegexp = /room:(\d+):queue/;

function getRoom(roomId, cb) {
	return client.get(util.format(queuKeyPattern, roomId), function parseRoom(err, room) {
		var parsed;

		if (err) {
			return cb(err);
		}

		if (!room) {
			return cb(new Error('Could not find room ' + roomId));
		}

		try {
			parsed = JSON.parse(room);
		} catch (e) {
			return cb(e);
		}

		parsed.id = roomId;

		return cb(null, parsed);
	});
}

function createRoom(room, callback) {
	client.incr('roomid', function (err, roomId) {
		var genreMap = {
			'Techno': 'techno',
			'Rock': 'rock',
			'Disco': 'disco',
			'Hip-Hop': 'hip-hop-rap'
		};
		if (err) {
			return callback(err);
		}

		trackChooser.getTracks(room.genre, function saveRoom (err, tracks) {
			if (err) {
				return callback(err);
			}


			client.set(util.format(queuKeyPattern, roomId), JSON.stringify({
				name: room.name,
				genre: room.genre,
				history: [],
				current: tracks.shift(),
				queue: tracks
			}));

			return callback(err, roomId);
		});
	});
}

function updateRoom(room, callback) {
	var cloned = _.cloneDeep(room);
	delete cloned.id;
	return client.set(util.format(queuKeyPattern, room.id),
		JSON.stringify(cloned), callback);
}

function allRooms(callback) {
	client.KEYS(util.format(queuKeyPattern, '*'),
		function fetchRooms(err, rooms) {
		var rooms;

		if (err) {
			return callback(err);
		}

		async.map(rooms, function fetchRoom(roomId, cb) {
			client.get(roomId.toString(), function (err, room) {
				var parsed;
				try {
					parsed = JSON.parse(room);
				} catch (e) {
					return cb(e);
				}

				parsed.id = Number(queueRegexp.exec(roomId)[1]);

				return cb(err, parsed);
			});
		}, callback);
	});
}

function seedRooms(callback) {
	async.map([
			{ genre: 'Techno', name: 'Tasty Trance Tunes' },
			{ genre: 'Rock', name: 'Robot Rock' },
			{ genre: 'Disco', name: 'Dalston Disco Den' },
			{ genre: 'Hip-Hop', name: 'Herbert\'s Hip-Hop Emporium' },
			{ genre: 'Rock', name: 'Lions Rock n Roll Club' },
			{ genre: 'Techno', name: 'Techno Turbo Fun' },
			{ genre: 'Hip-Hop', name: 'Spiffy Hip-Hop' }
		],
		function createRooms(room, cb) {
			console.log('creating demo room: %s', room.name);
			createRoom(room, cb);
		}, callback);
}

function init(callback) {

	allRooms(function readRooms(err, rooms) {
		if (err) {
			throw err;
		}

		if (!rooms || rooms.length < 4) {
			return seedRooms(callback);
		}

		callback();
	});

}

module.exports = exports = {
	init: init,
	all: allRooms,
	get: getRoom,
	create: createRoom,
	update: updateRoom
};
