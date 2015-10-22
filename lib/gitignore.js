'use strict';

const gitignoreParser = require('gitignore-parser');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('graceful-fs'));
const logger = require('./logger');
const pkg = require('../package.json');
const path = require('path');
const _ = require('lodash');
const utils = require('./utils');

const GITIGNORE = '.gitignore';

function updateGitignore(cwd, opts, log) {
  log = log || logger;
  opts = _.defaults(opts || {}, {
    ignore: []
  });
  opts.ignore = [].concat(opts.ignore);
  const isIgnored = _.partial(_.has, opts.ignore);
  cwd = cwd || process.cwd();

  return utils.isGit(cwd)
    .then((result) => {
      if (result) {
        const symlinks = pkg.config['digs-dev'].symlink;
        const gitignorePath = path.join(cwd, GITIGNORE);

        if (opts.ignore.length) {
          log.info(`Ignoring non-symlinks: ${opts.ignore.join(', ')}`);
        }
        return fs.readFileAsync(gitignorePath, 'utf8')
          .then((contents) => {
            const gitignore = gitignoreParser.compile(contents);
            return {
              contents: contents.split('\n'),
              entries: _(symlinks)
                .reject(gitignore.denies)
                .reject(isIgnored)
                .value()
            };
          })
          .error(() => {
            log.info('.gitignore not found; creating');
            return {
              contents: [],
              entries: _.reject(symlinks, isIgnored)
            };
          })
          .then((data) => {
            const contents = data.contents;
            const entries = data.entries;

            if (!_.isEmpty(entries)) {
              let beforeLen = 0;
              let afterLen = 0;

              return {
                contents: _(contents)
                  .tap((lines) => {
                    beforeLen = lines.length;
                  })
                  .concat(entries)
                  .tap((lines) => {
                    afterLen = lines.length;
                  })
                  .join('\n'),
                appended: afterLen - beforeLen
              };
            }
            log.ok(`${gitignorePath} up-to-date; nothing to do`);
          })
          .then((obj) => {
            if (obj) {
              return fs.writeFileAsync(gitignorePath, obj.contents)
                .then(() => {
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
