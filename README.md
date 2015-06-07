# digs-dev

Common development dependencies for digs.

[![NPM](https://nodei.co/npm/digs-dev.png?compact=true)](https://www.npmjs.com/package/digs-dev)

[![Join the chat at https://gitter.im/digsjs/digs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/digsjs/digs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Warning

This is an experiment.    

## What It Does

Provides common development requirements to **digs** and its minions.

## Why It Does It

I have a fair amount of dotfiles, test fixtures and Grunt task files that are common to all packages in [digsjs](https://github.com/digsjs).

These files are necessary for development on our packages, but have nothing to do with production code.

It sounds like `peerDependencies` is going the way of the dodo, so this was my idea, and I don't have any others.  If you have a better one, [I'd love to hear it](https://github.com/digsjs/digs-dev/issues).

## How It Works

Each package requiring **digs-dev** has a `prepublish` script which will execute the function exported by `index.js`, passing the cwd.

Said function takes cwd and symlinks a bunch of crap from itself into the cwd.  This includes dotfiles, Grunt task files, and packages.
 
Of note, *everything* in **digs-dev**'s `dependencies` property is symlinked. 
 
All symlinked dotfiles and Grunt tasks should be in `.gitignore`.

Any existing file which does *not* happen to be a symlink which **digs-dev** wants to overwrite will be skipped.  This does not apply to packages. 

## Author

[Christopher Hiller](http://boneskull.com)

## License

MIT

