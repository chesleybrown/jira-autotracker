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
			server: 'node app/server.js',
			run: 'node app/cli.js'
		}
	});
	
	grunt.registerTask('default', ['env', 'exec:run']);
	grunt.registerTask('server', ['env', 'exec:server']);
};