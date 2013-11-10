module.exports = {
	// 7digital OAuth consumer key
	consumerKey: process.env.CONSUMER_KEY,
	// 7digital OAuth consumer secret
	consumerSecret: process.env.CONSUMER_SECRET,
	rollbarToken: process.env.ROLLBAR_ACCESS_TOKEN,
	// Number of seconds to wait for the robot to populate the room
	// when the queue is empty, before reattempting to process the 
	// room.
	populationDelay: 10
};
