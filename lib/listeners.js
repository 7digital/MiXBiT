var _ = require('lodash');
var fn = require('./fn');
var config = require('./config');
var util = require('util');
var async = require('async');
var redis = require('redis');
var trackChooser = require('./track-chooser');
var client = redis.createClient({
	port: config.redisPort,
	host: config.redisHost
});
var keyPattern = 'room:%s:listeners';

if (config.redisDatabase !== 0) {
	client.select(config.redisDatabase);
}

function addListener(roomId, socketId, callback) {
	callback = callback || fn.noop;
	return client.sadd(util.format(keyPattern, roomId), socketId, callback);
}

function removeListener(socketId, callback) {
	callback = callback || fn.noop;
	client.KEYS(util.format(keyPattern, '*'), removeSocketFromListeners);
	function removeSocketFromListeners(err, roomListenerKeys) {
		if (err) {
			console.error('Error retrieving listener keys');
			console.error(err);
			return callback(err);
		}

		async.map(roomListenerKeys, function removeSocketId(roomListenerKey, cb) {
			client.srem(roomListenerKey, socketId, cb);
		}, callback);
	}
}

function resetListeners(callback) {
	callback = callback || fn.noop;
	client.KEYS(util.format(keyPattern, '*'), emptyListeners);
	function emptyListeners(err, roomListenerKeys) {
		if (err) {
			console.error('Error retrieving listener keys');
			console.error(err);
			return callback(err);
		}

		async.map(roomListenerKeys, function removeSocketId(roomListenerKey, cb) {
			client.del(roomListenerKey, cb);
		}, callback);
	}
}

module.exports = exports = {
	keyPattern: keyPattern,
	addListener: addListener,
	removeListener: removeListener,
	resetListeners: resetListeners
};
