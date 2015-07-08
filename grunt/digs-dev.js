'use strict';

let Promise = require('bluebird');

module.exports = function (grunt) {

  grunt.registerTask('digs-dev', 'Execute a digs-dev command',
    function (command) {
      let done = this.async();
      let args = Array.prototype.slice(arguments, 1);
      let digsDev = require('../lib');
      if (digsDev[command]) {
        return Promise.try(function () {
          return digsDev[command].apply(null, args.concat(grunt));
        })
          .then(done, function (err) {
            grunt.fail.warn(err);
          });
      }
      grunt.fail.warn(`Command "${command}" not found!`);
    });
};
