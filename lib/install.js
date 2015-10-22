'use strict';

const symlink = require('./symlink');
const upgrade = require('./upgrade');
const logger = require('./logger');
const gitignore = require('./gitignore');

function install(cwd, opts, log) {
  log = log || logger;
  return upgrade(cwd, log)
    .then(() => {
      return symlink(cwd, log);
    })
    .then((ignore) => {
      return gitignore(cwd, {
        ignore: ignore
      }, log);
    })
    .then(() => {
      log.ok('Install complete.');
    });
}

module.exports = install;
