'use strict';

const log = require('./logger');
const pkg = require('../package.json');
const _ = require('lodash');

function uniquifyArgs(argv) {
  return _.pick(argv, (v, k) => {
    return k.length > 1;
  });
}

function execute(command, argv, grunt) {
  const args = uniquifyArgs(argv);
  log.info(`digs-dev@v${pkg.version} executing command "${command}"`);
  if (arguments.length < 3) {
    return execute[command](argv._[1], args);
  }
  return execute[command](args, grunt.log);
}

execute.symlink = require('./symlink');
execute.install = require('./install');
execute.upgrade = require('./upgrade');
execute.gitignore = require('./gitignore');

module.exports = execute;
