var _ = require('lodash');
var async = require('async');
var redis = require('redis');
var robot = require('./robot-dj');
var client = redis.createClient();
var api = require('7digital-api').configure({
	consumerkey: process.env.CONSUMER_KEY,
	consumersecret: process.env.CONSUMER_SECRET
});

function getRoom(roomId, cb) {
	return client.get('room:' + roomId, function parseRoom(err, room) {
		if (err) {
			return cb(err);
		}

		return cb(null, JSON.parse(room));
	});
}

function createRoom(room, callback) {
	client.incr('roomid', function (err, roomId) {
		if (err) {
			return callback(err);
		}

		robot.getTracks(room.genre, function saveRoom (err, tracks) {
			if (err) {
				return callback(err);
			}


			client.set('room:' + roomId, JSON.stringify({
				name: room.name,
				genre: room.genre,
				history: [],
				current: null,
				queue: tracks
			}));

			robot.monitor(roomId);

			return callback(err, roomId);
		});
	});
}

function updateRoom(room, callback) {
	return process.nextTick(callback);
}

function allRooms(callback) {
	client.KEYS('room:*', function (err, rooms) {
		var rooms;

		if (err) {
			return callback(err);
		}

		async.map(rooms, function (roomId, cb) {
			client.get(roomId.toString(), function (err, room) {
				var parsed;
				try {
					parsed = JSON.parse(room);
				} catch (e) {
					return cb(e);
				}

				parsed.id = roomId.substring(roomId.indexOf(':') + 1);

				return cb(err, parsed);
			});
		}, callback);
	});
}

function seedRooms(callback) {
	// more than one room results in callback being called several times
	async.map([ 'Rock', 'Techno', 'Disco', 'Hip-Hop' ],
		function createRooms(genre, cb) {
			console.log('creating demo room: %s', genre);
			createRoom({
				name: genre + ' demo',
				genre: genre
			}, cb);
		}, callback);
}

function init(callback) {
	client.get('roomid', function (err, reply) {
		if (err) {
			throw err;
		}

		if (!reply) {
			client.set('roomid', 27589);
		}

		allRooms(function readRooms(err, rooms) {
			if (err) {
				throw err;
			}

			if (!rooms || rooms.length < 4) {
				return seedRooms(callback);
			}

			callback();
		});
	});
}

module.exports = {
	init: init,
	all: allRooms,
	get: getRoom,
	create: createRoom,
	update: updateRoom
};
