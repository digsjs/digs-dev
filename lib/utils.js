'use strict';

let Promise = require('bluebird');
let stat = Promise.promisify(require('graceful-fs').stat);
let path = require('path');

function isGit(dir) {
  return stat(path.join(dir, '.git'))
    .then(function isStatDir(st) {
      return st.isDirectory();
    })
    .catch(function fail() {
      return false;
    });
}

module.exports = {
  isGit: isGit
};
