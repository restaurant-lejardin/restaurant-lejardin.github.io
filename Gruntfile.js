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
      t1_en: {
        expand: true,
        cwd: '_site/',
        src: 'en/**/*.html',
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

    // Custom HTML minification task
    htmlmin: {
      t1: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '*.html',
          dest: 'dist/'
        }]
      },
      t1_en: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: 'en/**/*.html',
          dest: 'dist/'
        }]
      }
    }

  });

  // Load the grunt plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-purifycss');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');
  
  // Custom task for HTML minification using html-minifier-terser
  grunt.registerTask('htmlmin', 'Minify HTML files', async function() {
    const minify = require('html-minifier-terser').minify;
    const fs = require('fs').promises;
    const path = require('path');
    const { glob } = require('glob');
    
    const done = this.async();
    
    try {
      const files = await glob('dist/*.html');
      
      if (files.length === 0) {
        grunt.log.writeln('No HTML files found to minify');
        done();
        return;
      }
      
      for (const file of files) {
        try {
          const data = await fs.readFile(file, 'utf8');
          
          const minified = await minify(data, {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            minifyCSS: true,
            minifyJS: true
          });
          
          await fs.writeFile(file, minified);
          grunt.log.writeln('✓ ' + path.relative(process.cwd(), file) + ' minified');
        } catch (err) {
          grunt.log.error('Error processing file: ' + file + ' - ' + err.message);
          done(false);
          return;
        }
      }
      
      grunt.log.writeln('Minified ' + files.length + ' HTML files');
      done();
    } catch (err) {
      grunt.log.error('Error finding files: ' + err.message);
      done(false);
    }
  });
  
  // Default task(s).
  grunt.registerTask('build', ['shell:jekyllBuild']);
  grunt.registerTask('serve', ['shell:jekyllServe']);
  grunt.registerTask('serve-dist', ['shell:distServe']);
  //grunt.registerTask('default', ['clean']);
  //grunt.registerTask('default', ['purifycss']);
  //grunt.registerTask('default', ['cssmin']);
  //grunt.registerTask('default', ['htmlmin']);
};
