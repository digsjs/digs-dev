'use strict';

let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('fs'));
let mkdirp = Promise.promisify(require('mkdirp'));
let path = require('path');
let npmVersion = Promise.promisify(require('npm-version'));
let semver = require('semver');
let log = require('loggy');
let pkg = require('../package.json');

const NODE_MODULES = 'node_modules';

function symlink(cwd) {
  cwd = cwd || process.cwd();
  let config = pkg.config['digs-dev'];
  let symlinks = config.symlink;

  return npmVersion()
    .then(function (version) {
      if (semver.lt(version, '3.0.0')) {
        log.info('Detected npm < v3.0.0.  Installing packages.');
        return require('./install')(cwd)
          .return(symlinks);
      }
      return fs.lstatAsync(path.join(cwd, NODE_MODULES, pkg.name))
        .then(function (stats) {
          if (stats.isSymbolicLink()) {
            log.info('Detected symlinked digs-dev.  Installing packages.');
            return require('./install')(cwd)
              .return(symlinks);
          }
          return symlinks;
        });
    })
    .map(function (relativeSrc) {
      let dest = path.join(cwd, relativeSrc);
      return fs.lstatAsync(dest)
        .then(function (stats) {
          if (!stats.isSymbolicLink()) {
            let target = path.relative(cwd, dest);
            return Promise.reject(`Skipping ${target}; not a symlink`);
          }
          return fs.unlinkAsync(dest);
        })
        .error(function () {
          let dir = path.dirname(relativeSrc);
          if (dir !== '.') {
            return mkdirp(path.join(cwd, dir));
          }
        })
        .then(function () {
          let src = path.join(__dirname, '..', relativeSrc);
          return fs.symlinkAsync(src, dest)
            .return(src);
        })
        .then(function (src) {
          let from = path.relative(cwd, src);
          let to = path.relative(cwd, dest);
          log.info(`Symlinked ${from} => ${to}`);
        })
        .catch(function (err) {
          log.warn(err);
        });
    });
}

module.exports = function (argv, grunt) {
  if (arguments.length < 2) {
    return symlink(argv._[1]);
  }
  log = grunt.log;
  return symlink(argv);
};

