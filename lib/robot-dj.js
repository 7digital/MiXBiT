var config = require('./config');
var rooms = require('./rooms');
var trackChooser = require('./track-chooser');

function createRoomMonitor(room, notifier) {
	function scheduleUpdate(err, updateInfo) {
		backFillQueue(room.id);

		setTimeout(function skipNextAndNotify() {
			moveNext(room, scheduleUpdate);
			notifier(room);
		}, updateInfo.nextTrackDuration * 1000);
	}

	moveNext(room, scheduleUpdate);
}

function moveNext(room, callback) {
	var needsTracks = false;
	var nextTrackDuration;

	if (room.current) {
		// room already playing
		room.history.push(room.current);
	}

	if (room.history.length > 3) {
		room.history.shift();
	}

	if (room.queue.length > 0) {
		room.current = room.queue.shift();
		room.current.startTime = new Date();
	}

	needsTracks = (room.queue.length < 2);
	nextTrackDuration = room.queue[0]
		? room.queue[0].duration
		: config.populationDelay;

	rooms.update(room, function (err) {
		if (err) {
			return callback(err);
		}

		callback(null, {
			roomId: room.id,
			needsTracks: needsTracks,
			nextTrackDuration: nextTrackDuration
		});
	});
}

function backFillQueue(roomId) {
	rooms.get(roomId, function getTracksToPopulateRetrievedRoom(err, room) {
		if (err) {
			console.log('Error getting room to back fill: %s', roomId);
			console.dir(err);
			return;
		}

		trackChooser.getTracks(room.genre, function updateQueue(err, tracks) {
			if (err) {
				console.log('Error getting tracks to back fill: %s', roomId);
				console.dir(err);
				return;
			}
			room.queue = room.queue.concat(tracks);
			rooms.update(room, function roomUpdated(err) {
				if (err) {
					console.log('Error updating room: %j', room);
					console.dir(err);
					return;
				}
			});
		});
	});
}

function monitor(room, notifier) {
	rooms.get(room.id, function startRoom(err, room) {
		if (err) {
			console.log('Error getting room to monitor: %s', roomId);
			console.dir(err);
			return;
		}

		if (!room) {
			console.log('Could not find room to monitor: %s', roomId.toString);
			console.dir(err);
			return;
		}

		createRoomMonitor(room, notifier);
	});
}

module.exports = {
	monitor: monitor
};
