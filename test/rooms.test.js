var rooms = require('../lib/rooms');

rooms.get(123, function (err, tracks) {
	console.log(err, tracks);
});
