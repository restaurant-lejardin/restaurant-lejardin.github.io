module.exports = function(grunt) {

  grunt.initConfig({
    shell: {
      jekyllBuild: {
        command: 'jekyll build'
      },
      jekyllServe: {
        command: 'jekyll serve'
      },
      distServe: {
        command: 'cd dist && python3 -m http.server 8080'
      }
    },
    purifycss: {
      options: {
        whitelist: ['footer-logo-spacing']
      },
      target: {
        src: ['_site/*.html', '_site/js/*.js', '_site/components/*.html'],
        css: ['_site/css/*.css'],
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
          cwd: '_site/js/',
          src: '*.js',
          dest: 'dist/js'
        }]
      }
    },

    copy: {
      t1: {
        expand: true,
        cwd: '_site/',
        src: '*.html',
        dest: 'dist/'
      },
      t2: {
        expand: true,
        cwd: '_site/',
        src: 'data/*.json',
        dest: 'dist/'
      },
      t3: {
        expand: true,
        cwd: '_site/',
        src: 'manifest.json',
        dest: 'dist/'
      },
      t4: {
        expand: true,
        cwd: '_site/',
        src: 'service-worker.js',
        dest: 'dist/'
      },
      t5: {
        expand: true,
        cwd: '_site/',
        src: 'media/**',
        dest: 'dist/'
      },
      t6: {
        expand: true,
        cwd: '_site/',
        src: 'components/**',
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
  grunt.loadNpmTasks('grunt-shell');
  
  // Default task(s).
  grunt.registerTask('build', ['shell:jekyllBuild']);
  grunt.registerTask('serve', ['shell:jekyllServe']);
  grunt.registerTask('serve-dist', ['shell:distServe']);
  //grunt.registerTask('default', ['clean']);
  //grunt.registerTask('default', ['purifycss']);
  //grunt.registerTask('default', ['cssmin']);
  //grunt.registerTask('default', ['htmlmin']);
};
