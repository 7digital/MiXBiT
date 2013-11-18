var assert = require('assert');
var util = require('util');
var redis = require('redis');
var config = require('../lib/config');
var listeners = require('../lib/listeners');

describe('listeners', function () {

	var client = redis.createClient({
		host: config.redisHost,
		port: config.redisPort
	});
	var testRoomId = 42;
	var testRoomKey = util.format(listeners.keyPattern, testRoomId);
	var testSocketId = 424242;

	before(function selectTestDatabase(done) {
		client.select(config.redisDatabase, done);
	});

	describe('adding and removing listeners', function () {

		before(function setupDummyData(done) {
			client.sadd(testRoomKey, testSocketId, function (err) {
				if (err) return done(err);
				done();
			});
		});

		after(function clearDb(done) {
			client.flushdb(function (err) {
				if (err) return done(err);
				done();
			});
		});

		it('should add and remove the socket', function (done) {
			listeners.addListener(testRoomId, testSocketId + 1, checkAdded);
			function checkAdded(err) {
				client.smembers(testRoomKey, checkAndRemove);
				function checkAndRemove(err, members) {
					if (err) return done(err);

					assert.equal(2, members.length);
					listeners.removeListener(testSocketId + 1, function (err) {
						if (err) return done(err);

						client.smembers(testRoomKey, function (err, members) {
							if (err) return done(err);

							assert.equal(1, members.length);
							done();
						});

					});
				}
			}
		});

	});

	describe('resetListeners', function () {

		before(function setupDummyData(done) {
			client.sadd(testRoomKey, testSocketId, function (err) {
				if (err) return done(err);
				done();
			});
		});

		after(function clearDb(done) {
			client.flushdb(function (err) {
				if (err) return done(err);
				done();
			});
		});


		it('should clear all listener sets', function (done) {
			listeners.resetListeners(function (err) {
				if (err) return done(err);

				client.smembers(testRoomKey, function (err, sockets) {
					assert.ok(!err);
					assert.equal(0, sockets.length);
					done();
				});

			});
		});

	});

});
