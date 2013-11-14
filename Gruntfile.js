'use strict';

module.exports = function configureGrunt(grunt) {

	var nodemonIgnores = [
		'karma.conf.js',
		'/client/',
		'/build/',
		'/temp/',
		'/.tmp',
		'/.sass-cache',
		'*.txt',
		'Gruntfile.js',
		'README.md',
		'/.git/',
		'/node_modules/',
		'node-inspector.js'
	];

	require('time-grunt')(grunt);

	require('matchdep')
		.filterDev('grunt-*')
		.forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		watch: {
			options: {
				livereload: true
			},
			compass: {
				files: ['client/sass/**/*.{scss,sass}'],
				tasks: ['compass:server'],
				options: {
					livereload: true,
				},
			},
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'dist/*',
						'!dist/.git*'
					]
				}]
			},
			server: ['.tmp']
		},
		jshint: {
			files: [
				'Gruntfile.js',
				'server.js',
				'lib/**/*.js',
				'client/scripts/**/*.js'
			],
			options:  {
				jshintrc: '.jshintrc'
			}
		},
		requirejs: {
			app: {
				options: {
					name: 'app',
					almond: true,
					replaceRequireScript: [{
						files: ['views/layouts/main.handlebars'],
						module: 'main'
					}],
					baseUrl: 'client/scripts/',
					shim: {
						handlebars: {
							deps: [],
							exports: 'Handlebars',
						},
						lodash: {
							deps: [],
							exports: '_',
							init: function () {
								return this._.noConflict();
							},
						}
					},
					optimize: 'uglify2',
					generateSourceMaps: true,
					preserveLicenseComments: false,
					useStrict: true,
					wrap: true,
					mainConfigFile: 'client/scripts/config.js',
					out: 'dist/client/scripts/app.dist.js'
				}
			},
		},
		rev: {
			dist: {
				files: {
					src: [
						'dist/client/scripts/**/*.js',
						'dist/client/styles/**/*.css',
						'dist/client/images/**/*.{png,jpg,jpeg,gif,webp}',
						'dist/client/styles/fonts/**/*.*'
					]
				}
			}
		},
		useminPrepare: {
			options: {
				dest: 'dist',
				root: 'client'
			},
			html: ['client/{,*/}*.html', 'views/**/*.handlebars']
		},
		usemin: {
			options: {
				dirs: ['dist/client'],
				basedir: 'dist/client'
			},
			html: ['dist/client/{,*/}*.html', 'dist/views/**/*.handlebars'],
			css: ['dist/client/styles/{,*/}*.css']
		},
		nodemon: {
			dev: {
				options: {
					file: 'server.js',
					args: ['development'],
					watchedExtensions: [
						'js'
					],
					debug: true,
					delayTime: 1,
					ignoredFiles: nodemonIgnores
				}
			},
			nodeInspector: {
				options: {
					file: 'node-inspector.js',
					watchedExtensions: [
						'js'
					],
					exec: 'node-inspector',
					ignoredFiles: nodemonIgnores
				},
			},
		},
		bower: {
			options: {
			},
			all: {
				rjsConfig: 'client/scripts/app.js'
			}
		},
		compass: {
			options: {
				sassDir: 'client/sass',
				cssDir: '.tmp/styles',
				imagesDir: 'client/images',
				generatedImagesDir: '.tmp/images',
				fontsDir: 'client/styles/fonts'
			},
			dist: {
				options: {
					generatedImagesDir: 'dist/client/images',
					environment: 'production'
				}
			},
			server: {
				options: {
					debugInfo: true
				}
			}
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'client',
					dest: 'dist/client',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'images/**/*.{webp,gif}',
						'styles/fonts/{,*/}*.*'
					]
				}, {
					expand: true,
					dot: true,
					cwd: 'views',
					dest: 'dist/views/',
					src: '**/*.handlebars'
				}]
			},
			styles: {
				expand: true,
				dot: true,
				cwd: 'client/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			},
		},
		concurrent: {
			nodemon: {
				options: {
					logConcurrentOutput: true,
				},
				tasks: [
					'nodemon:nodeInspector',
					'nodemon:dev',
					'watch'
				]
			},
			server: [
				'compass:server',
				'copy:styles'
			],
			dist: [
				'copy:styles',
				'compass:dist'
			]
		}
	});

	grunt.registerTask('server', [
		'concurrent:server',
		'concurrent:nodemon'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:dist',

		'useminPrepare',
		'requirejs:app',

		'cssmin',

		'rev',
		'usemin',

		'copy:dist'
	]);

};
