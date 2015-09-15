'use strict';

module.exports = function (grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var devPath = 'src';
    var distPath = 'dist';
    var tmpPath = '.tmp';

    // Project configuration
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Project settings available as grunt templates: <%= projCfg.dev %> etc.
        projCfg: {
            dev: devPath,
            dist: distPath,
            tmp: tmpPath,
        },

        cssmin: {
            build: {
                files: {
                    'build/application.css': [ 'build/**/*.css' ]
                }
            }
        },

        //// specify an alternate install location for Bower
        //bower: {
        //    dev: {
        //        dest: 'base/static/libs'
        //    },
        //    tasks: ['bowerInstall']
        //},

        // Automatically inject Bower components.
        // In the html there are two sections: bower:css and bower:js, in the
        // compareapp.scss there is a bower:scss section - this selects the type of resource
        // to insert.
        bowerInstall: {

            app: {
                src: ['templates/index.html'],
                // ignorePath: the part of a file's path that gets ignored when inserting it:
                ignorePath: new RegExp('^<%= projCfg.dev %>/'),
                // ignores the bootstrap js from bootstrap-sass-official - we use UI Bootstrap
                exclude: ['bootstrap-sass-official']
            },
            sass: {
                src: ['<%= projCfg.dev %>/scss/{,*/}*.{scss,sass}'],
                ignorePath: '<%= projCfg.dev %>/bower_components/'
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
                dest: 'static/informal-routr.min.js',
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
                    'dist/informal-routr.css'
                ],
                dest: 'static/'
            }
        },

        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0',
                livereload: 35729
            },
            dev: {
                options: {
                    open: true,
                    base: '<%= projCfg.dev %>'
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= projCfg.dist %>'
                }
            }
        },
        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= projCfg.tmp %>/styles/',
                    src: '{,*/}*.css',
                    dest: '<%= projCfg.tmp %>/styles/'
                }]
            }
        },

        /**
         *
         */
        bower_concat: {
            all: {
                dest: 'build/_bower.js',
                cssDest: 'build/_bower.css',
                exclude: [
                    'jquery',
                    'modernizr'
                ],
                dependencies: {
                    'underscore': 'jquery',
                    'backbone': 'underscore',
                    'jquery-mousewheel': 'jquery'
                },
                bowerOptions: {
                    relative: false
                },
                mainFiles: {
                    'leaflet-toolbar': [
                        "src/Toolbar.Control.js",
                        "src/Toolbar.js",
                        "src/Toolbar.Popup.js",
                        "src/ToolbarAction.js"]
                }
            }
        }
    });

    grunt.registerTask('serve', [
        'buildDev',
        'connect:dev',
        'watch',
    ]);

    grunt.registerTask('buildDev',
        [
            'uglify',
            'bowerInstall',
            'autoprefixer',
            'cssmin',
            'copy',
        ]
    );

    grunt.registerTask(
        'build',
        'Compiles all of the assets and copies the files to the build directory.',
        [ 'clean', 'copy' ]
    );

    grunt.registerTask('default',

        'Watches the project for changes, automatically builds them and runs a server.',
        [ 'build', 'connect', 'watch' ]
        //[
        //    'uglify',
        //    'bowerInstall',
        //    'autoprefixer',
        //    'cssmin',
        //    'copy',
        //]
    );

    grunt.registerTask('distribute', [
        "bower_concat"
    ]);
};