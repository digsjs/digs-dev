'use strict';

let fs = require('fs'),
  mkdirp = require('mkdirp'),
  path = require('path');

function dev(cwd) {

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
    let dir = path.dirname(src);
    if (dir !== '.') {
      try {
        mkdirp.sync(dir);
      } catch (ignored) {}
    }
    src = path.join(__dirname, src);
    if (!fs.existsSync(src)) {
      throw new Error('digs-dev: source file "%s" does not exist!');
    }
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

module.exports = dev;

if (require.main === module) {
  dev(process.argv[2]);
}

