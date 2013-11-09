// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('UeIyoMvSlMEPTZ94');

var isProduction, port,
	express = require('express'),
	rollbar = require('rollbar'),
	path = require('path'),
	pkg = require('./package'),
	app = express(),
	server = require('http').createServer(app),
	hbjs = require('express3-handlebars'),
	routes = require('./routes'),
	port = 3000,
	url  = 'http://localhost:' + port + '/';

if (process.env.NODE_ENV === 'production' || process.argv[2] === 'production') {
	console.log('Running in production');
	app.set('env', 'production');
	isProduction = (process.env.NODE_ENV === 'production');
	port = (isProduction ? 80 : 8000);
} else {
	app.set('env', 'development');
}

// configuration
app.engine('handlebars', hbjs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(rollbar.errorHandler(process.env.ROLLBAR_ACCESS_TOKEN));

// routes
app.get('/', routes.index);

// startup
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
});
