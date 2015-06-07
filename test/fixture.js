'use strict';

var chai = require('chai'),
  Promise = require('bluebird');

global.expect = chai.expect;
global.sinon = require('sinon');

chai.use(require('sinon-chai'));

Promise.longStackTraces();
