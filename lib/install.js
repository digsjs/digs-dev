'use strict';

let symlink = require('./symlink');
let upgrade = require('./upgrade');
let logger = require('./logger');

function install(cwd, log) {
  log = log || logger;
  return upgrade(cwd, log)
    .then(function execSymlink() {
      return symlink(cwd, log);
    })
    .then(function report() {
      log.ok('Install complete.');
    });
}

module.exports = install;
