#! /usr/bin/env node

var _ = require('lodash');
var rooms = require('./lib/rooms');
var robotDj = require('./lib/robot-dj');

rooms.all(function (err, rooms) {
	_.each(rooms, function monitorRoom(room) {
		robotDj.monitor(room, process.send);
	});
});
