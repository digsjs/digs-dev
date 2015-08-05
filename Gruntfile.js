'use strict';

module.exports = function gruntfile (grunt) {
  let loadGruntConfig = require('load-grunt-config');
  let pkg = grunt.file.readJSON('package.json');
  let digsDevPkg;
  try {
    digsDevPkg = grunt.file.readJSON('node_modules/digs-dev/package.json');
  } catch (ignored) {
    digsDevPkg = pkg;
  }

  /**
   * Random bits of crap to send to the Grunt templates
   * @type {{pkg: Object, bower: ?Object, min: Function, author: *}}
   */
  let data = {
    pkg: pkg,
    author: typeof pkg.author === 'string' ? pkg.author :
      [pkg.author.name, pkg.author.email].join(' '),
    digsDevPkg: digsDevPkg
  };

  Object.defineProperty(data, 'author', {

    /**
     * Normalizes `author` field of `package.json`.
     * @returns {string} Author name(s) and email(s)
     */
    get: function author () {
      function _author (auth) {
        var format;
        if (typeof auth === 'string') {
          return auth;
        }
        format = require('util').format;
        return format('%s <%s>', auth.name, auth.email);
      }

      if (Array.isArray(pkg.author)) {
        return pkg.author.map(function makeAuthor (auth) {
          return _author(auth);
        }).join(', ');
      }
      return _author(pkg.author);
    }
  });

  if (grunt.option('time')) {
    require('time-grunt')(grunt);
  }

  grunt.registerTask('watch-digs-dev', ['concurrent:watch-digs-dev']);

  loadGruntConfig(grunt, {
    jitGrunt: {
      staticMappings: {
        devUpdate: 'grunt-dev-update',
        'bump-only': 'grunt-bump',
        'bump-commit': 'grunt-bump',
        'mocha_istanbul': 'grunt-mocha-istanbul'
      }
    },
    data: data
  });
};
