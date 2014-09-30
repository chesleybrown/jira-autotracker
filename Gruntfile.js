'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		env: {
			default: {
				src: '.env.dist'
			},
			setup: {
				src: '.env'
			}
		},
		exec: {
			run: 'node app.js'
		}
	});
	
	grunt.registerTask('default', ['env', 'exec:run']);
};