
module.exports = function (grunt) {

	grunt.initConfig({

		// Configure a mochaTest task
		mochaTest: {
			test: {
				options: {
					reporter: 'mocha-unfunk-reporter'
				},
				src: ['tests/*_test.js']
			}
		},

		watch: {
			scripts: {
				files: [
					'*.js',
					'**/*.js'
				],
				tasks: ['mochaTest'],
				options: {
					spawn: true,
				},
			},
		},

	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-mocha-test');


	grunt.registerTask('default', ['mochaTest']);
	grunt.registerTask('dev', [ 'default', 'watch' ]);


};
