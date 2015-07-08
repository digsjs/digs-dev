'use strict';

let which = require('which');
let log = require('loggy');
let execFile = require('child-process-promise').execFile;
let pkg = require('../package.json');

function install(cwd) {
  return which('npm')
    .then(function (npm) {
      log.log(`Using npm at ${npm}`);
      return Promise.each(Object.keys(pkg.dependencies), function (dep) {
        let ver = pkg.dependencies[dep];
        log.info(`Installing "${dep}@${ver}"`);
        return execFile(npm, ['install', `${dep}@${ver}`], {
          cwd: cwd
        })
          .catch(function (err) {
            log.warn(err);
          });
      });

    });
}

module.exports = function (argv, grunt) {
  if (arguments.length < 2) {
    return install(argv._[1]);
  }
  log = grunt.log;
  return install(argv);
};

module.exports.install = install;
