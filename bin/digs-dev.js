#!/usr/bin/env node

'use strict';

let yargs = require('yargs');
let path = require('path');
let execute = require('../lib');

// note to self: "var" is intended here
var argv = yargs
  .usage('Usage: $0 <command>')
  .command('symlink',
  `Symlink digs-dev's dotfiles into current or target directory`,
  function symlink(y) {
    argv = y
      .usage('Usage: $0 symlink [target-dir]')
      .help('help')
      .alias('help', 'h')
      .argv;
  })
  .command('upgrade',
  `Install/upgrades digs-dev's dependencies into current or target directory.` +
  `(will modify your "package.json" if the directory is under Git VC)`,
  function upgrade(y) {
    argv = y.usage('Usage: $0 install [target-dir]')
      .help('help')
      .alias('help', 'h')
      .argv;
  })
  .command('install',
  `Performs both an "upgrade" and a "symlink"`,
  function install(y) {
    argv = y.usage('Usage: $0 install [target-dir]')
      .help('help')
      .alias('help', 'h')
      .argv;
  })
  .option('help', {
    alias: 'h',
    describe: 'Show this help, or specify a command for details',
    example: '$0 --help [command]',
    type: 'string'
  })
  .version(function getVersion() {
    return require(path.join(__dirname, '..', 'package.json')).version;
  })
  .showHelpOnFail(true)
  .check(function check(finalArgv) {
    if (finalArgv.hasOwnProperty('help')) {
      yargs.showHelp();
      return true;
    }
    if (execute[finalArgv._[0]]) {
      return true;
    }
    throw new Error('Command is required!');
  })
  .argv;

execute(argv._[0], argv);


