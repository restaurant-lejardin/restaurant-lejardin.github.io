module.exports = function(grunt) {

  grunt.initConfig({
    
    purifycss: {
      options: {},
      target: {
        src: ['src/*.html', 'src/js/*.js'],
        css: ['src/css/*.css'],
        dest: 'dist/css/purestyles.css'
      },
    },

    cssmin: {
      t1: {
        files: [{
          expand: true,
          cwd: 'dist/css/',
          src: ['purestyles.css'],
          dest: 'dist/css/',
          ext: '.css'
        }]
      }
    },
    
    uglify: {
      t1: {
        files: [{
          expand: true,
          cwd: 'src/js/',
          src: '*.js',
          dest: 'dist/js'
        }]
      }
    },

    copy: {
      t1: {
        expand: true,
        cwd: 'src/',
        src: '*.html',
        dest: 'dist/'
      },
      t2: {
        expand: true,
        cwd: 'src/config',
        src: '*.json',
        dest: 'dist/config'
      },
      t3: {
        expand: true,
        cwd: 'src/',
        src: 'manifest.json',
        dest: 'dist/'
      },
      t4: {
        expand: true,
        cwd: 'src/',
        src: 'service-worker.js',
        dest: 'dist/'
      }
    },

    htmlmin: {                                    
      t1: {                                     
        options: {                                 
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '*.html',
          dest: 'dist/'
        }]
      },
    }

  });

  // Load the grunt plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-purifycss');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  // Default task(s).
  //grunt.registerTask('default', ['clean']);
  //grunt.registerTask('default', ['purifycss']);
  //grunt.registerTask('default', ['cssmin']);
  //grunt.registerTask('default', ['htmlmin']);
};
