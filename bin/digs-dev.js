#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const execute = require('../lib');
const _ = require('lodash');
const pkg = require('../package.json');
const emoji = require('node-emoji');
const chalk = require('chalk');

// not a mistake
/* eslint no-var:0 */
var argv;

function commandYargs(y, name, options) {
  options = options || '[target-dir]';
  return y.usage(`Usage: $0 ${name} ${options}`)
    .help('help')
    .alias('help', 'h')
    .argv;
}

argv = yargs
  .usage(`Usage: $0 <command>`)
  .command('symlink',
    `Symlink digs-dev's dotfiles into current or target directory`,
    _.partialRight(commandYargs, 'symlink'))
  .command('upgrade',
    `Install/upgrade digs-dev's devDependencies into current or target ` +
    `directory (will modify your "package.json" if the directory is under VCS)`,
    _.partialRight(commandYargs, 'upgrade'))
  .command('install',
    `Performs an "upgrade", "symlink" & "gitignore"`,
    _.partialRight(commandYargs, 'install'))
  .command('gitignore',
    `Updates .gitignore to include all symlinked files`,
    _.partialRight(commandYargs, 'gitignore'))
  .option('help', {
    alias: 'h',
    describe: 'Show this help, or specify a command for details',
    example: '$0 --help [command]',
    type: 'string'
  })
  .version(() => pkg.version)
  .check((_argv) => {
    if (_.has(_argv, 'help')) {
      yargs.showHelp('log');
      return true;
    }
    if (_.isEmpty(_argv._)) {
      throw new Error(`${emoji.get('exclamation')}  Command is required`);
    }
    const command = _.first(_argv._);
    if (!_.has(execute, command)) {
      throw new Error(`${emoji.get('exclamation')}  Unknown command ` +
        `"${command}"`);
    }
    return true;
  })
  .epilog(`${emoji.get('bug')}  Problems? ` +
    chalk.underline(`https://github.com/digsjs/digs-dev/issues/`))
  .argv;

execute(argv._[0], argv);
