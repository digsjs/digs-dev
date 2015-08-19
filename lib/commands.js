'use strict';

let log = require('./logger');
let pkg = require('../package.json');

function execute(command, argv, grunt) {
  if (arguments.length < 3) {
    return execute[command](argv._[1]);
  }
  log.info(`digs-dev [${pkg.version}] executing command "${command}"`);
  return execute[command](argv, grunt.log);
}

execute.symlink = require('./symlink');
execute.install = require('./install');
execute.upgrade = require('./upgrade');

module.exports = execute;
