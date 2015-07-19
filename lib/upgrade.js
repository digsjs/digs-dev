'use strict';

let path = require('path');
let Promise = require('bluebird');
let which = Promise.promisify(require('which'));
let logger = require('./logger');
let execFile = require('child-process-promise').execFile;
let semver = require('semver');
let _ = require('lodash');
let devDeps = require('../package.json').devDependencies;
let fs = require('fs');
let stat = Promise.promisify(fs.stat);

function rangeToVersion(range) {
  let sets = new semver.Range(range, true).set;
  if (sets.length > 1) {
    return String(range);
  }
  return String(_.first(_.first(sets)).semver);
}

function upgrade(cwd, log) {
  log = log || logger;
  cwd = cwd || process.cwd();

  let parentPkg;
  let parentDevDeps;
  let parentName;
  try {
    parentPkg = require(`${cwd}/package.json`);
    parentName = parentPkg.name || `package at ${cwd}`;
    parentDevDeps = parentPkg.devDependencies || {};
  } catch (e) {
    throw new Error(`No package.json found in ${cwd}`);
  }

  log.info('Installing new/upgraded development dependencies.');

  let successes = 0;
  let failures = 0;

  return Promise.all([
    which('npm'),
    stat(path.join(cwd, '.git'))
      .then(function(stat) {
        return stat.isDirectory();
      })
      .catch(function() {
        return false;
      })
  ])
    .spread(function(npm, isGit) {
      log.log(`Using npm at ${npm}`);
      return Promise.each(_.keys(devDeps), function(dep) {
        let ver;
        let parentVer;
        let parentMissingDep;
        if (!_.startsWith(devDeps[dep], 'github:')) {
          ver = rangeToVersion(devDeps[dep]);
          parentVer = parentDevDeps[dep] && rangeToVersion(parentDevDeps[dep]);
          parentMissingDep = !parentVer;
        } else {
          parentMissingDep = parentDevDeps[dep] !== devDeps[dep];
        }
        if (parentMissingDep || ver && semver.ltr(parentVer, ver)) {
          ver = devDeps[dep];
          if (parentMissingDep) {
            log.info(`Package "${parentName}" missing devDep "${dep}@${ver}"`);
          } else {
            parentVer = parentDevDeps[dep];
            log.info(`Package "${parentName}" has "${dep}" v${parentVer} < `
              `${ver}`);
          }

          let args = ['install', `${dep}@${ver}`];
          if (isGit) {
            args.push('--save-dev');
            log.info(`Installing (with "--save-dev") devDep "${dep}@${ver}"`);
          }
          else {
            log.info(`Installing devDep "${dep}@${ver}"`);
          }
          return execFile(npm, args, {
            cwd: cwd
          })
            .then(function() {
              successes++;
            })
            .catch(function(err) {
              log.warn(err);
              failures++;
            });
        }
      });
    })
    .then(function() {
      if (successes || failures) {
        log.ok(`Upgraded ${successes} package(s) with ${failures} ` +
          `failure(s).`);
      } else {
        log.ok(`All packages up-to-date!`);
      }
    });
}

module.exports = upgrade;
