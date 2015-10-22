'use strict';

const EventEmitter = require('events').EventEmitter;
const emoji = require('node-emoji');
const _ = require('lodash');
const format = require('util').format;
const chalk = require('chalk');

let log;

const LEVELS = {
  debug: {
    color: chalk.dim,
    emoji: 'beetle',
    errorLevel: 0
  },
  log: {
    color: chalk.white,
    emoji: 'point_right',
    errorLevel: 1
  },
  info: {
    color: chalk.blue,
    emoji: 'bulb',
    errorLevel: 2
  },
  ok: {
    color: chalk.green,
    emoji: 'ok_hand',
    errorLevel: 3
  },
  warn: {
    color: chalk.yellow,
    emoji: 'warning',
    errorLevel: 4
  },
  error: {
    color: chalk.red,
    emoji: 'exclamation',
    errorLevel: 5
  }
};

class Logger extends EventEmitter {
  constructor(logLevel) {
    super();

    this.level = logLevel || 'log';

    _.each(LEVELS, (settings, name) => {
      this[name] = function logMethod() {
        const level = LEVELS[name];
        const args = [
          emoji.get(level.emoji),
          ' ',
          level.color.apply(null, arguments)
        ];
        if (settings.errorLevel >= LEVELS[this.level].errorLevel) {
          console.log.apply(this, args);
        }
        this.emit(level, format(arguments));
      };
    });

    /* eslint consistent-this:0 */
    log = this;
  }

  get level() {
    return this._level;
  }

  set level(value) {
    if (LEVELS[value]) {
      this._level = value;
    } else {
      throw new Error('invalid log level');
    }
  }
}

Logger.Logger = Logger;

module.exports = log || new Logger();
