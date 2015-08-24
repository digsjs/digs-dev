'use strict';

let gitignoreParser = require('gitignore-parser');
let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('graceful-fs'));
let logger = require('./logger');
let pkg = require('../package.json');
let path = require('path');
let _ = require('digs-utils');
let utils = require('./utils');

const GITIGNORE = '.gitignore';

function updateGitignore(cwd, log) {
  log = log || logger;
  cwd = cwd || process.cwd();

  return utils.isGit(cwd)
    .then(function maybeUpdate(result) {
      if (result) {
        const symlinks = pkg.config['digs-dev'].symlink;
        const gitignorePath = path.join(cwd, GITIGNORE);
        return fs.readFileAsync(gitignorePath, 'utf-8')
          .then(function getInfo(contents) {
            const gitignore = gitignoreParser.compile(contents);
            const newEntries = _.reject(symlinks, gitignore.denies);
            if (newEntries.length) {
              let beforeLen = 0;
              let afterLen = 0;

              contents = _(contents)
                .split('\n')
                .tap(function getBeforeLines(lines) {
                  beforeLen = lines.length;
                })
                .concat(newEntries)
                .tap(function getAfterLines(lines) {
                  afterLen = lines.length;
                })
                .join('\n');

              return {
                contents: contents,
                appended: afterLen - beforeLen
              };
            }
            log.ok(`${gitignorePath} up-to-date; nothing to do`);
          })
          .error(function createGitignore() {
            log.warn(`${gitignorePath} does not exist.  Creating...`);
            return fs.readFileAsync(path.join(__dirname,
                'templates',
                'gitignore'),
              'utf-8')
              .then(function write(contents) {
                return fs.writeFileAsync(gitignorePath, contents);
              })
              .then(function returnSymlinks() {
                log.ok(`Created ${gitignorePath}`);
                return {
                  contents: symlinks.join('\n'),
                  appended: symlinks.length
                };
              });
          })
          .then(function write(obj) {
            if (obj) {
              return fs.writeFileAsync(gitignorePath, obj.contents)
                .then(function report() {
                  log.ok(`Appended ${obj.appended} entries to` +
                    `${gitignorePath}`);
                });
            }
          });
      }
      log.info(`${cwd} is not under version control; skipping.`);
    });
}

module.exports = updateGitignore;
