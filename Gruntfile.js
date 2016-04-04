module.exports = function(grunt) {
    var jsFiles = ['scripts/logreg.js'];
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                expand: true,
                src: jsFiles,
                dest: 'server/public',
                ext: '.min.js'
            }
        },
        sass: {
          dist: {
              files: {
                  'server/public/styles/style.css':'sass/style.scss'
              }
          }
        },
        watch: {
          css: {
                files: 'sass/*.scss',
                tasks: ['sass'],
                options: {
                    spawn: false
                }
          },
    			scripts: {
    				files: jsFiles,
    				tasks: ['uglify'],
    				options: {
    					spawn: false
    				}
    			}
    		}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'watch', 'sass']);

};
