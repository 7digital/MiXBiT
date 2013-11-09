'use strict';

require.config({
	paths: {
		jquery: '../bower_components/jquery/jquery',
		handlebars: '../bower_components/handlebars/handlebars.runtime',
		lodash: '../bower_components/lodash/dist/lodash.compat',
		socketio: '../../socket.io/socket.io',
		audiojs: '../bower_components/audiojs/audiojs/audio'
	},
	shim: {
		'socketio': {
			exports: 'io'
		},
		handlebars: {
			deps: [],
			exports: 'Handlebars'
		},
		lodash: {
			deps: [],
			exports: '_'
		},
		audiojs: {
			deps: [],
			exports: 'audiojs'
		}
	}
});
