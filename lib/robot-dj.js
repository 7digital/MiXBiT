var config = require('./config');
var rooms = require('./rooms');
var trackChooser = require('./track-chooser');

function monitor(room, notifier) {
	function scheduleUpdate(err, updateInfo) {
		var timeoutMs;

		if (err) {
			console.log('%s : Ignoring error updaing', room.id);
			console.error(err);
		}

		if (updateInfo.needsTracks) {
			console.log('%s : Starting backfill', room.id);
			backFillQueue(room.id);
		}

		timeoutMs = updateInfo.nextTrackDuration * 1000;
		console.log('%s : Scheduling next update in %s', room.id, timeoutMs);
		setTimeout(function skipNextAndNotify() {
			moveNext(room, scheduleUpdate);
			console.log('%s : Scheduling next update', room.id);
			notifier(room);
		}, timeoutMs);
	}

	moveNext(room, scheduleUpdate);
}

function moveNext(room, callback) {
	var needsTracks = false;
	var nextTrackDuration;

	console.log('%s : Updating %s', room.id, room.name);

	if (room.current) {
		// room already playing
		room.history.push(room.current);
	}

	if (room.history.length > 3) {
		console.log('%s : Dropping history', room.id);
		room.history.shift();
	}

	if (room.queue.length > 0) {
		console.log('%s : Progressing queue', room.id);
		room.current = room.queue.shift();
		room.current.startTime = new Date();
	}

	needsTracks = (room.queue.length < 2);
	console.log('%s : Checked queue, needsTracks is: %s',
		room.id,
		needsTracks);
	nextTrackDuration = room.queue[0]
		? room.queue[0].duration
		: config.populationDelay;

	console.log('%s : Saving', room.id);
	rooms.update(room, function (err) {
		if (err) {
			console.log('%s : Error saving', room.id);
			return callback(err);
		}

		console.log('%s : Saved', room.id);
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

module.exports = {
	monitor: monitor
};
