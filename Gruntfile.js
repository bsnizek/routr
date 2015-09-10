'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // specify an alternate install location for Bower
        bower: {
            dev: {
                dest: 'base/static/libs'
            }
        },

        watch: {
            files: [
                'dist/*.css',
                'dist/*.js',
                'templates/*.html'
            ],
            tasks: ['bower', 'uglify']
        },

        // minification of the .js files
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['dist/informal-routr.js'],
                dest: 'static/informal-router.min.js',
                options: {
                    stripJsAffix: true
                }
            }
        },

        // jshint
        jshint: {
            all: [
                'Gruntfile.js',
                'dist/informal-routr.js'
            ]
        },

        // copy modules assets under /static/assets
        copy: {
            all: {
                expand: true,
                //cwd: 'flaskapp/',
                src: [
                    'dist/*.js',
                    'dist/*.css'
                ],
                dest: 'base/static/assets/'
            }
        }

    });

    // Default task(s)
    grunt.registerTask('default', ['bower', 'uglify', 'copy']);
};