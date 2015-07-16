'use strict';

let symlink = require('./symlink');
let upgrade = require('./upgrade');
let logger = require('./logger');

function install(cwd, log) {
  log = log || logger;
  return upgrade(cwd, log)
    .then(function() {
      return symlink(cwd, log);
    })
    .then(function() {
      log.ok('Install complete.');
    });
}

module.exports = install;
