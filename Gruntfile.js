module.exports = function(grunt) {

	'use strict';

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-recess');


	// Project configuration
	grunt.initConfig({

		// Metadata
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',

		// Source Files we are working with
		src: {
			css: [
				'css/bootstrap.css',
				'css/icomoon.css',
				'css/app.css'
			],
			js: [
				'js/jquery.js',
				'js/bootstrap.js',
				'js/datasource.js',
				'js/search.js',
				'js/datagrid.js',
				'js/lastfm.js',
				'js/app.js'
			]
		},

		// Task configuration
		clean: {
			dist: ['dist']
		},

		copy: {
			fonts: {
				expand: true,
				src: ['fonts/icomoon.*'],
				dest: 'dist/'
			}
		},

		concat: {
			options: {
				banner: '<%= banner %>'
			},
			js: {
				src: '<%= src.js %>',
				dest: 'dist/js/app.<%= pkg.version %>.js'
			}
		},

		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			build: {
				src: '<%= concat.js.dest %>',
				dest: 'dist/js/app.<%= pkg.version %>.min.js'
			}
		},

		recess: {
			options: {
				compile: true
			},
			css: {
				src: '<%= src.css %>',
				dest: 'dist/css/app.<%= pkg.version %>.css'
			},
			min: {
				src: '<%= src.css %>',
				dest: 'dist/css/app.<%= pkg.version %>.min.css',
				options: {
					compress: true
				}
			}
		},

		qunit: {
			all: ['test/**/*.html']
		},

		watch: {
			js: {
				files: '<%= src.js %>',
				tasks: ['dist-js']
			},
			css: {
				files: '<%= src.css %>',
				tasks: ['dist-css']
			}
		}

	});

	// JS distribution task
	grunt.registerTask('dist-js', ['concat', 'uglify']);

	// CSS distribution task
	grunt.registerTask('dist-css', ['recess']);

	// Fonts distribution task
	grunt.registerTask('dist-fonts', ['copy']);

	// Default task
	grunt.registerTask('default', ['clean', 'dist-css', 'dist-fonts', 'dist-js']);

};