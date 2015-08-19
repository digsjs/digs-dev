'use strict';

let gitignoreParser = require('gitignore-parser');
let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('graceful-fs'));
let logger = require('./logger');
let pkg = require('../package.json');
let path = require('path');
let _ = require('digs-utils');

const GITIGNORE = '.gitignore';

function updateGitignore(cwd, log) {
  log = log || logger;
  cwd = cwd || process.cwd();

  const symlinks = pkg.config['digs-dev'].symlinks;

  return fs.readFileAsync(path.join(cwd, GITIGNORE), 'utf-8')
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
      log.ok(`${GITIGNORE} up-to-date; nothing to do`);
    })
    .error(function createGitignore() {
      log.warn(`${GITIGNORE} does not exist.  Creating...`);
      return fs.readFileAsync(path.join(__dirname, 'templates', 'gitignore'),
        'utf-8')
        .then(function write(contents) {
          return fs.writeFileAsync(path.join(cwd, GITIGNORE), contents);
        });
    })
    .then(function maybeWrite(obj) {
      if (obj) {
        return fs.writeFileAsync(GITIGNORE, obj.contents)
          .then(function report() {
            log.ok(`Appended ${obj.appended} entries to ${GITIGNORE}`);
          });
      }
      log.ok(`Created ${GITIGNORE}.`);
    });
}

module.exports = updateGitignore;
