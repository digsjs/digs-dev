'use strict';

let symlink = require('./symlink');
let upgrade = require('./upgrade');
let logger = require('./logger');
let gitignore = require('./gitignore');

function install(cwd, opts, log) {
  log = log || logger;
  return upgrade(cwd, log)
    .then(function execSymlink() {
      return symlink(cwd, log);
    })
    .then(function execGitignore(failures) {
      return gitignore(cwd, {
        ignore: failures
      }, log);
    })
    .then(function report() {
      log.ok('Install complete.');
    });
}

module.exports = install;
