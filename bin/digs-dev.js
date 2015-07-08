#!/usr/bin/env node

'use strict';
let yargs = require('yargs');
let path = require('path');
let digsDev = require('../lib');

var argv = yargs
  .usage('Usage: $0 <command>')
  .command('symlink',
  'Symlink digs-dev\'s dotfiles into current or target directory',
  function (yargs) {
    argv = yargs
      .usage('Usage: $0 symlink [target-dir]')
      .help('help')
      .alias('help', 'h')
      .argv;
  })
  .command('install',
  'Install digs-dev\'s dependencies into current or target directory',
  function (yargs) {
    argv = yargs.usage('Usage: $0 install [target-dir]')
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
  .version(function () {
    return require(path.join(__dirname, '..', 'package.json')).version;
  })
  .showHelpOnFail(true)
  .check(function (argv) {
    if (argv.hasOwnProperty('help')) {
      yargs.showHelp();
      return true;
    }
    let command = argv._[0];
    if (digsDev[command]) {
      return true;
    }
    throw new Error('Command is required!');
  })
  .argv;

let command = argv._[0];
if (command) {
  digsDev[command](argv);
}

