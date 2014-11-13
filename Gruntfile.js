// Gruntfile.js
module.exports = function(grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      files: {
        src: [
          '*.js',
          'lib/**/*.js',
          'test/**/*.js',
          'examples/**/*.js'
        ]
      }
    },
    jscs: {
      options: {
        preset: 'google'
      },
      main: [
        '*.js',
        'lib/**/*.js',
        'test/**/*.js',
        'examples/**/*.js'
      ]
    },
    simplemocha: {
      all: {src: ['test/*.js']}
    }
  });

  grunt.registerTask('test', ['jshint', 'jscs', 'simplemocha']);
  grunt.registerTask('default', []);
};
