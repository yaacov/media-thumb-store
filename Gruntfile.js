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
    jsdoc : {
        dist : {
            src: [
              './lib/*.js', 
              './lib/backends/*.js', 
              './lib/thumbnailers/*.js'
            ],
            jsdoc: './node_modules/.bin/jsdoc',
            options: {
                destination: 'doc',
                configure: './node_modules/jsdoc/conf.json.EXAMPLE',
                template: './node_modules/ink-docstrap/template'
            }
        }
    },
    simplemocha: {
      all: {src: ['test/*.js']}
    }
  });

  grunt.registerTask('test', ['jshint', 'jscs', 'simplemocha']);
  grunt.registerTask('default', []);
};
