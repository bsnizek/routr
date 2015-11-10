(function () {
    'use strict';
    // this function is strict...
}());

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
    var projCfg = '';

    var distPath = 'dist';
    var tmpPath = '.tmp';

    // Kill the noise for now. Handle these errors later:
    //                 devPath + '/views/{,*/}*.html'];
    // appJsFiles is for rev.
    var appJsFiles = ['/scripts/{,*/}*.js'];
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
            tmp: tmpPath
        },

        uglify:
        { build: {
            files: {
                'dist/static/js/optimized.min.js':
                    [
                        'dev/static/js/informal-routr-main.js',
                        'dev/static/js/informal-routr-routes.js' ]
            }
        },
            generated: {
                files: [
                    { dest: 'dist/static/js/vendor.js', src: [ '.tmp/concat/dist/static/js/vendor.js' ] },
                    { dest: 'dist/static/js/optimized.js',
                        src: [ '.tmp/concat/static/js/optimized.js' ] } ] } },


        // 1. minification of the .js files
        // TODO: add variables and *
        //uglify: {
        //    options: {
        //        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        //        '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //    },
        //    build: {
        //        src: [
        //            'dev/static/js/informal-routr-main.js',
        //            'dev/static/js/informal-routr-routes.js'
        //        ],
        //        dest: 'dist/static/js/optimized.min.js',
        //        options: {
        //            stripJsAffix: true
        //        }
        //    }
        //},



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

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dev/static/images',
                    // generated are handled by copy:
                    src: ['{,*/}*.{png,jpg,jpeg,gif}', '!generated/'],
                    dest: 'dist/static/images'
                }, {
                    expand : true,
                    flatten : true,
                    cwd : 'dev/static/bower_components',
                    src : '**/*.{png,jpg,jpeg,gif}',
                    // TODO. Why styles? Because they are refered to from styles relatively?:
                    dest : 'dist/static'
                }]
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
                    'dev/templates/*.html'
                ]
                //ignorePath: the part of a file's path that gets ignored when inserting it:
                //ignorePath: new RegExp('^<%= projCfg.dev %>/'),
                // ignores the bootstrap js from bootstrap-sass-official - we use UI Bootstrap
                //exclude: ['bootstrap-sass-official'],
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
                    'dev/static/informal-routr.min.css': [ 'dev/static/css/*.css' ]
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

        // copy modules assets under /static/assets
        copy: {

            dev: {
                src: [
                    'dist/informal-routr.css'
                ],
                dest: 'dev/static/'
            },
            all: {
                expand: true,
                //cwd: 'flaskapp/',
                src: [
                    'dist/informal-routr.css'
                ],
                dest: 'dev/static/'
            },
            dist: {
                files: [
                    //    {
                    //    expand: true,
                    //    dot: true,
                    //    // Copy styles back to dev so cssmin can work on them, copying them to dist
                    //    cwd: '.tmp',
                    //    dest: 'dev',
                    //    src: [
                    //        'styles/{,*/}*.css'
                    //    ]
                    //},
                    //    {
                    //    expand: true,
                    //    cwd: '.tmp/images',
                    //    dest: 'dist/static/images',
                    //    src: ['generated/**']
                    //},
                    {
                        expand: true,
                        dot:true,

                        cwd: 'dev/templates',

                        src: [
                            '*'
                        ],
                        dest: 'dist/templates'

                    },
                    //{
                    //    expand: true,
                    //    dot: true,
                    //    cwd: 'dev',
                    //    dest: 'dist',
                    //    src: [
                    //        // styles and images are copied to dist by cssmin and imagemin
                    //        '*.{ico,png,txt}',
                    //        '*.html',
                    //        'images/{,*/}*.{webp}',
                    //        'scripts/{,*/}*.js',
                    //        'styles/{,*/}*.htc',
                    //        'styles/fonts/*',
                    //        'html/{,*/}*.html',
                    //        '*.xml',
                    //        '*.topojson',
                    //    ]
                    //},
                    //{
                    //    expand: true,
                    //    dot: true,
                    //    cwd: '.tmp/styles',
                    //    dest: 'dist/static/styles',
                    //    src: [
                    //        'ie8fixes.css'
                    //    ]
                    //}, {
                    //    expand: true,
                    //    dot: true,
                    //    cwd: 'dev/static/bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/',
                    //    dest: 'dist/static/styles/fonts/',
                    //    src: '*'
                    //}
                ]
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
                'dev/templates/*.html'
            ],
            options: {
                dest: 'dist/templates',
                staging: '.tmp',
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

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: [
                'dist/templates/index.html',
                // Also process these, for resources like images etc.: TODO: does it work?
                'dist/templates/{,*/}*.html'
            ],
            css: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/static',
                        src: appCssFiles
                        //dest: 'build/',   // Destination path prefix.
                        //extDot: 'first'   // Extensions in filenames begin after the first dot
                    },
                ],
            },
            options: {
                assetsDirs: [
                    'dev/static/images',
                ]
            }
        },
        // Run some tasks in parallel to speed up the build process
        concurrent: {
            dist: [
                //'compass:dist',
                'imagemin'
            ]
        }
    });

    grunt.registerTask('serve', [
        'buildDev',
        'connect:dev',
        'watch',
    ]);

    grunt.registerTask('buildDev', [
            'jshint',
            //'clean:dev',  TODO: enable
            //'uglify',
            'bowerInstall',
            'autoprefixer',
            'copy:dev'
        ]
    );

    grunt.registerTask('buildDist', [
        'clean',
        'bowerInstall',
        //'nggettext_extract',
        //'nggettext_compile',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'ngmin',
        'copy:dist',
        'cssmin',
        'uglify',
        'rev',
        'usemin'
    ]);

    grunt.registerTask(
        'build',
        'Compiles all of the assets and copies the files to the build directory.',
        [ 'clean', 'copy' ]
    );

    grunt.registerTask('testUglify', [
        'bowerInstall',
        "useminPrepare",
        "concat",
        "uglify",
    ]);


};