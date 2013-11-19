var isProduction, port,
	express = require('express'),
	rollbar = require('rollbar'),
	path = require('path'),
	config = require('./lib/config'),
	pkg = require('./package'),
	sock = require('./lib/sock'),
	app = express(),
	rooms = require('./lib/rooms'),
	robotMonitor = require('./lib/robot-monitor'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	hbjs = require('express3-handlebars'),
	routes = require('./lib/routes'),
	listeners = require('./lib/listeners'),
	port = 3000,
	url  = 'http://localhost:' + port + '/';

var hbs = hbjs.create({
		defaultLayout: 'main',
		helpers: {
			toLowerCase: function (string) {
				'use strict';
				return string.toLowerCase();
			},
			smallPack: function (string) {
				'use strict';
				return string.replace(/_350.jpg$/, '_50.jpg');
			},
			listeners: function () {
				'use strict';
				return Math.floor(Math.random() * 16).toString();
			}
		}
	});

if (process.env.NODE_ENV === 'production' || process.argv[2] === 'production') {
	console.log('Running in production');
	app.set('env', 'production');
	isProduction = true;
	port = 80;
} else {
	app.set('env', 'development');
}

/*
* Per-environment config
*/
if (app.get('env') === 'development') {
	app.set('views', __dirname + '/views');
	app.use(express.static(path.join(__dirname, '.tmp')));
	app.use(express.static(path.join(__dirname, 'client')));
	app.use(express.logger('dev'));
	app.use(express.favicon(__dirname + '/client/images/favicon.ico'));
	app.use(express.errorHandler());
} else if (app.get('env') === 'production') {
	app.set('views', __dirname + '/views');
	app.use(express.static(path.join(__dirname, '.tmp')));
	app.use(express.static(path.join(__dirname, 'client')));
	app.use(express.logger());
	app.use(express.favicon(__dirname + '/dist/client/images/favicon.ico'));
}

// configuration
app.engine('handlebars',  hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.compress());
app.use(express.bodyParser());
app.use(app.router);
app.use(rollbar.errorHandler(config.rollbarToken));

// routes
app.get('/', routes.index);
app.get('/room/:id', routes.room);
app.post('/room/create', routes.createRoom);

// startup
sock.listen(io);

listeners.resetListeners(function (err) {
	if (err) throw err;

	server.listen(port, function(err) {
		if (err) { console.error(err); process.exit(-1); }

		// if run as root, downgrade to the owner of this file
		if (process.getuid() === 0) {
			require('fs').stat(__filename, function(err, stats) {
				if (err) { return console.error(err); }
				process.setuid(stats.uid);
			});
		}

		console.log("%s server listening on port %s", pkg.name, port);
		robotMonitor.monitor();
		console.log('Robot DJ is running');
	});
});
