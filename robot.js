#! /usr/bin/env node

var _ = require('lodash');
var rooms = require('./lib/rooms');
var robotDj = require('./lib/robot-dj');

if (process.argv.length <= 2) {
	return monitorAll();
}

function die(msg) {
	console.error(msg);
	process.exit(1);
}

switch (process.argv[2]) {
	case 'init':
		return initRooms();
	case 'monitor':
		return monitorOne();
	case 'monitor-all':
		return monitorAll();
	default:
		return die('Unrecognised command');
}

function monitorAll() {
	rooms.all(function (err, rooms) {
		_.each(rooms, function monitorRoom(room) {
			console.log('Monitoring room %s', room.name);
			robotDj.monitor(room, function (room) {
				console.log('******* NOTIFIED **********');
			});
		});
	});
}

function monitorOne() {
	if (process.argv.length < 4) {
		return die('Missing room id');
	}
	rooms.get(process.argv[3], function (err, room) {
		if (err || !room) {
			return die(err || 'Could not find room');
		}

		robotDj.monitor(room, function (room) {
			console.log('******* NOTIFIED **********');
		});
	});
}

function initRooms() {
	rooms.init(function initComplete(err) {
		console.log('Initialised some rooms');
		process.exit(0);
	});
}
