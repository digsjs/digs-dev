'use strict';

let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');

function symlink(grunt, cwd) {
  cwd = cwd || process.cwd();
  let pkg = require('../package.json');
  let config = pkg.config['digs-dev'];
  let symlinks = config.symlink.concat(fs.readdirSync(path.join(__dirname, '..',
    'node_modules',
    '.bin')).map(function (filename) {
    return path.join('node_modules', '.bin', filename);
  }));

  symlinks.forEach(function (src) {
    let dest = path.join(cwd, src);
    try {
      let stats = fs.lstatSync(dest);
      if (!stats.isSymbolicLink()) {
        let target = path.relative(cwd, dest);
        grunt.log.warn(`Skipping ${target}; not a symlink`);
        return;
      }
    }
    catch (ignored) {
      // ignore
    }
    try {
      fs.unlinkSync(dest);
    }
    catch (ignored) {
      // ignore
    }
    let dir = path.dirname(src);
    if (dir !== '.') {
      try {
        mkdirp.sync(dir);
      } catch (ignored) {
        grunt.fail.warn(`Could not create directory ${dir}`);
      }
    }
    src = path.join(__dirname, '..', src);
    if (!fs.existsSync(src)) {
      grunt.fail.warn(`Source file ${src} does not exist`);
    }
    try {
      fs.symlinkSync(src, dest);
      let from = path.relative(cwd, src);
      let to = path.relative(cwd, dest);
      grunt.log.ok(`Symlinked ${from} => ${to}`);
    } catch (ignored) {
      // ignore
    }
  });

  Object.keys(pkg.dependencies).forEach(function (dep) {
    let dest = path.join(cwd, 'node_modules', dep);
    try {
      fs.unlinkSync(dest);
    }
    catch (ignored) {
      // ignore
    }
    let src = path.join(__dirname, '..', 'node_modules', dep);
    try {
      fs.symlinkSync(src, dest, 'dir');
      grunt.log.ok(`Symlinked package ${dep}`);
    } catch (ignored) {
      // ignore
    }
  });
}

function parseArgs(argv, grunt) {
  if (argv.hasOwnProperty('_') && Array.isArray(argv._)) {
    grunt = grunt || require('grunt');
    return symlink(grunt, argv._[1]);
  }
  return symlink.apply(null, arguments);
}

parseArgs.symlink = symlink;

module.exports = parseArgs;

