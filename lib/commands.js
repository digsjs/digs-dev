'use strict';

let log = require('./logger');
let pkg = require('../package.json');
let _ = require('lodash');

function uniquifyArgs(argv) {
  return _.pick(argv, (v, k) => {
    return k.length > 1;
  });
}

function execute(command, argv, grunt) {
  const args = uniquifyArgs(argv);
  if (arguments.length < 3) {
    return execute[command](argv._[1], args);
  }
  log.info(`digs-dev [${pkg.version}] executing command "${command}"`);
  return execute[command](args, grunt.log);
}

execute.symlink = require('./symlink');
execute.install = require('./install');
execute.upgrade = require('./upgrade');
execute.gitignore = require('./gitignore');

module.exports = execute;
