var config = {
	// 7digital OAuth consumer key
	consumerKey: process.env.CONSUMER_KEY,
	// 7digital OAuth consumer secret
	consumerSecret: process.env.CONSUMER_SECRET,
	rollbarToken: process.env.ROLLBAR_ACCESS_TOKEN,
	redisPort: process.env.REDIS_PORT || 6379,
	redisHost: process.env.REDIS_HOST || '127.0.0.1',
	redisDatabase: process.env.REDIS_DATABASE || 0,
	// Number of seconds to wait for the robot to populate the room
	// when the queue is empty, before reattempting to process the
	// room.
	populationDelay: 10
};

if (process.env.NODE_ENV === 'test') {
	config = require('../test/config')(config);
}

module.exports = exports = config;
