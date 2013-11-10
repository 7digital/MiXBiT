var trackChooser = require('../lib/track-chooser');

trackChooser.getTracks('techno', function (err, tracks) {
	console.log(err || tracks);
});
