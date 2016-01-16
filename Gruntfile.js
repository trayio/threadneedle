
module.exports = function (grunt) {

  grunt.initConfig({

    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/*.js']
    },

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
        tasks: ['jshint', 'mochaTest'],
        options: {
          spawn: true,
        },
      },
    },

  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');


  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('dev', ['default', 'watch']);


};