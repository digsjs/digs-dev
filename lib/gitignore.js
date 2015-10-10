'use strict';

let gitignoreParser = require('gitignore-parser');
let Promise = require('bluebird');
let fs = Promise.promisifyAll(require('graceful-fs'));
let logger = require('./logger');
let pkg = require('../package.json');
let path = require('path');
let _ = require('lodash');
let utils = require('./utils');

const GITIGNORE = '.gitignore';

function updateGitignore(cwd, opts, log) {
  log = log || logger;
  opts = _.defaults(opts || {}, {
    ignore: []
  });
  const ignore = [].concat(opts.ignore);
  cwd = cwd || process.cwd();

  return utils.isGit(cwd)
    .then(function maybeUpdate(result) {
      if (result) {
        const symlinks = pkg.config['digs-dev'].symlink;
        const gitignorePath = path.join(cwd, GITIGNORE);

        if (ignore.length) {
          log.info(`Ignoring non-symlinks: ${ignore.join(', ')}`);
        }
        return fs.readFileAsync(gitignorePath, 'utf8')
          .then((contents) => {
            const gitignore = gitignoreParser.compile(contents);
            return {
              contents: contents.split('\n'),
              entries: _(symlinks)
                .reject(gitignore.denies)
                .reject(ignore)
                .value()
            };
          })
          .error(() => {
            log.info('.gitignore not found; creating');
            return {
              contents: [],
              entries: _.reject(symlinks, ignore)
            };
          })
          .then(function getInfo(data) {
            const contents = data.contents;
            const entries = data.entries;

            if (entries.length) {
              let beforeLen = 0;
              let afterLen = 0;

              return {
                contents: _(contents)
                  .tap(function getBeforeLines(lines) {
                    beforeLen = lines.length;
                  })
                  .concat(entries)
                  .tap(function getAfterLines(lines) {
                    afterLen = lines.length;
                  })
                  .join('\n'),
                appended: afterLen - beforeLen
              };
            }
            log.ok(`${gitignorePath} up-to-date; nothing to do`);
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
