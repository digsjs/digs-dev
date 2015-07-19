'use strict';

let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('fs'));
let mkdirp = Promise.promisify(require('mkdirp'));
let path = require('path');
let logger = require('./logger');
let pkg = require('../package.json');

function symlink(cwd, log) {
  log = log || logger;
  cwd = cwd || process.cwd();
  let config = pkg.config['digs-dev'];
  let symlinks = config.symlink;
  let successes = 0;
  let failures = 0;

  return Promise.map(symlinks, function(relativeSrc) {
    let dest = path.join(cwd, relativeSrc);
    return fs.lstatAsync(dest)
      .then(function(stats) {
        if (!stats.isSymbolicLink()) {
          let target = path.relative(cwd, dest);
          return Promise.reject(`Skipping ${target}; not a symlink`);
        }
        return fs.unlinkAsync(dest);
      })
      .error(function() {
        let dir = path.dirname(relativeSrc);
        if (dir !== '.') {
          return mkdirp(path.join(cwd, dir));
        }
      })
      .then(function() {
        let src = path.join(__dirname, '..', relativeSrc);
        return fs.symlinkAsync(src, dest)
          .return(src);
      })
      .then(function(src) {
        let from = path.relative(cwd, src);
        let to = path.relative(cwd, dest);
        let relativeCwd = path.relative(cwd, process.cwd()) + path.sep;
        log.log(`Symlinked ${from} => ${relativeCwd}${to}`);
        successes++;
      })
      .catch(function(err) {
        log.warn(err);
        failures++;
      });
  })
    .then(function() {
      log.ok(`Symlinked ${successes} file(s) with ${failures} ` +
        `failure(s).`);
    });
}

module.exports = symlink;
