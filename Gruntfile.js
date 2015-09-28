'use strict';

module.exports = function (grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var devPath = 'dev';
    var deCssPath = 'dev/css';
    var devJSPath = 'dev/js';
    var devStaticPath = 'dev/static';
    var devTemplatesPath = 'dev/templates';

    var distPath = 'dist';
    var tmpPath = '.tmp';

    // Kill the noise for now. Handle these errors later:
    //                 devPath + '/views/{,*/}*.html'];
    // appJsFiles is for rev.
    var appJsFiles = ['/scripts/{,*/}*.js',];
    // appImageFiles is for rev.
    var appImageFiles = ['/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'];
    // appCssFiles is for rec and usemin/cssmin
    var appCssFiles = ['/styles/{,*/}*.css'];

    // Project configuration
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Project settings available as grunt templates: <%= projCfg.dev %> etc.
        projCfg: {
            dev: devPath,
            dist: distPath,
            tmp: tmpPath,
        },



        // 1. minification of the .js files
        // TODO: add variables and *
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: [
                    'dev/js/informal-routr-main.js',
                    'dev/js/informal-routr-routes.js'
                ],
                dest: 'static/informal-routr.min.js',
                options: {
                    stripJsAffix: true
                }
            }
        },

        // 2. bowerInstall
        // Automatically inject Bower components.
        // In the html there are two sections: bower:css and bower:js, in the
        // compareapp.scss there is a bower:scss section - this selects the type of resource
        // to insert.
        // TODO: fix the sass part
        bowerInstall: {
            app: {
                src: [
                    'dev/templates/index.html',
                    'dev/templates/routes.html'],
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

        // 3. autoprefixer
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

        // 4. cssmin
        // TODO figure this one out
        cssmin: {
            build: {
                files: {
                    'build/application.css': [ 'build/**/*.css' ]
                }
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



        // jshint
        jshint: {
            all: [
                'Gruntfile.js',
                'dist/informal-routr-main.js',
                'dist/informal-routr-routes.js'
            ]
        },

        clean: {
            all: {
                files: [{
                    dot: true,
                    src: [
                        '<%= projCfg.tmp %>',
                        '<%= projCfg.dist %>/*',
                        '<%= projCfg.dev %>/styles/*.css',
                        '!<%= projCfg.dist %>/.git*'
                    ]
                }]
            },
            dev:' <%= projCfg.tmp %>'
        },


        // copy modules assets under /static/assets
        copy: {
            all: {
                expand: true,
                //cwd: 'flaskapp/',
                src: [
                    'dist/informal-routr.css'
                ],
                dest: 'dev/static/'
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    // Copy styles back to dev so cssmin can work on them, copying them to dist
                    cwd: '<%= projCfg.tmp %>',
                    dest: '<%= projCfg.dev %>',
                    src: [
                        'styles/{,*/}*.css',
                    ]
                }, {
                    expand: true,
                    cwd: '<%= projCfg.tmp %>/images',
                    dest: '<%= projCfg.dist %>/images',
                    src: ['generated/**']
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= projCfg.dev %>',
                    dest: '<%= projCfg.dist %>',
                    src: [
                        // styles and images are copied to dist by cssmin and imagemin
                        '*.{ico,png,txt}',
                        '*.html',
                        'images/{,*/}*.{webp}',
                        'scripts/{,*/}*.js',
                        'styles/{,*/}*.htc',
                        'styles/fonts/*',
                        'html/{,*/}*.html',
                        '*.xml',
                        '*.topojson',
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= projCfg.tmp %>/styles/',
                    dest: '<%= projCfg.dist %>/styles/',
                    src: [
                        'ie8fixes.css'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= projCfg.dev %>/bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/',
                    dest: '<%= projCfg.dist %>/styles/fonts/',
                    src: '*'
                }
                ]
            },
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
        },

        // translate with angular-gettext
        nggettext_extract: {
            pot: {
                files: {
                    '<%= projCfg.dev %>/po/template.pot': ['<%= projCfg.dev %>/html/{,*/}*.html']
                }
            }
        },

        // ngmin tries to make the code safe for minification automatically by
        // using the Angular long form for dependency injection. It doesn't work on
        // things like resolve or inject so those have to be done manually.
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= projCfg.tmp %>/concat/scripts',
                    src: '*.js',
                    dest: '<%= projCfg.tmp %>/concat/scripts'
                }]
            }
        },

        nggettext_compile: {
            all: {
                files: {
                    '<%= projCfg.dev %>/scripts/translations/translations.js': ['<%= projCfg.dev %>/po/*.po']
                }
            }
        },

        // Renames files for browser caching purposes
        // todo: only our app files
        rev: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= projCfg.dist %>',
                        src: [appJsFiles, appImageFiles, appCssFiles, '<%= projCfg.dist %>/styles/fonts/*']
                        //dest: 'build/',   // Destination path prefix.
                        //extDot: 'first'   // Extensions in filenames begin after the first dot
                    },
                ],
            }
        },

        // Reads HTML for usemin blocks ('build') to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: [
                '<%= projCfg.dev %>/index.html'
            ],
            options: {
                dest: '<%= projCfg.dist %>',
                staging: '<%= projCfg.tmp %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            dist: [
                'compass:dist',
                'imagemin'
            ]
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
            'bowerInstall:app',
            'autoprefixer',
            'cssmin',
            'copy'
        ]
    );

    grunt.registerTask('experimental', [
        "uglify"
    ]);

    grunt.registerTask('buildDist', [
        //'clean',
        'bowerInstall',
        'nggettext_extract',
        'nggettext_compile',
        'useminPrepare',
        // 'concurrent:dist',
        'autoprefixer',
        'bower_concat',
        //'concat',
        'ngmin',
        'copy:dist',
        'cssmin',
        'uglify',
        'rev'
        //'usemin'
    ]);

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