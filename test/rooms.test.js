var robot = require('../lib/robot-dj');

robot.getTracks('techno', function (err, tracks) {
	console.log(err || tracks);
});
