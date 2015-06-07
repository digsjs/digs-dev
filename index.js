'use strict';

let fs = require('fs'),
  path = require('path');

module.exports = function dev(cwd) {

  let pkg = require('./package.json');
  let config = pkg.config['digs-dev'],
    symlink = config.symlink;

  symlink.forEach(function (src) {
    let dest = path.join(cwd, src);
    try {
      let stats = fs.lstatSync(dest);
      if (!stats.isSymbolicLink()) {
        return;
      }
    }
    catch (ignored) {}
    try {
      fs.unlinkSync(dest);
    }
    catch (ignored) {
    }
    src = path.join(__dirname, src);
    try {
      fs.symlinkSync(src, dest);
      console.log('Symlinked %s => %s',
        path.relative(cwd, src),
        path.relative(cwd, dest));
    } catch (ignored) {
    }
  });

  for (let dep in pkg.dependencies) {
    let dest = path.join(cwd, 'node_modules', dep);
    try {
      fs.unlinkSync(dest);
    }
    catch (ignored) {
    }
    let src = path.join(__dirname, 'node_modules', dep);
    try {
      fs.symlinkSync(src, dest, 'dir');
      console.log('Symlinked package %s', dep);
    } catch (ignored) {
    }
  }

};
