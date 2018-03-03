'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                compress: {
                    unsafe: true
                },
                screwIE8: false,
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.author.name %> | <%= pkg.license %> */'
            },
            build: {
                files: {
                    'dist/drop-upload.min.js': 'src/drop-upload.js',
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            files: 'src/**/*.js',
            tasks: 'default'
        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('build', ['uglify']);

    grunt.registerTask('default', 'build');
}
