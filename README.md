# digs-dev

> Common development dependencies for digs.

[![NPM](https://nodei.co/npm/digs-dev.png?compact=true)](https://www.npmjs.com/package/digs-dev)

[![Join the chat at https://gitter.im/digsjs/digs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/digsjs/digs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Warning

This is an experiment.    

## What It Does

Provides common development requirements to [digs](https://www.npmjs.com/package/digs) and its minions.

## Why It Does It

I have a fair amount of dotfiles, test fixtures and Grunt task files that are common to all packages in [digsjs](https://github.com/digsjs).

These files are necessary for development on our packages, but have nothing to do with production code.

I consulted with the folks @ [npm](https://www.npmjs.com/package/npm) on the best way to approach this problem, and this is the solution they suggested.  If you have a better one, [I'd love to hear it](https://github.com/digsjs/digs-dev/issues).

## How It Works

Each package requiring `digs-dev` must have a `prepublish` script which will execute the `install` command of the `digs-dev` executable, like so:

```sh
$ cd path/to/some/digsjs-package
$ digs-dev install
```

In `package.json`, this is simply:

```json
{ 
  "scripts": {
    "prepublish": "digs-dev install"
  }
}
```

The `install` command of the `digs-dev` executable does the following, as of this writing:

1.  Scans all development dependencies (`devDependencies`) in the current directory's `package.json`, and compares them to its own.  If anything is missing or out of date, the package is added or updated, respectively.  If the current directory has a `.git` subdirectory, the `--save-dev` option is added to the `npm` call.  This means if you happen to clone, say, `digs-common`, if the development deps are out-of-date, `package.json` will be in the "modified" state.  `package.json` is *not* added to Git's index, but somebody (you?) is expected to commit the changes.  
2.  Symlinks a bunch of dotfiles and configuration into the appropriate places.  Example: `Gruntfile.js`.  Another example: `.eslintrc`.  All packages under the **digsjs** banner have the same `Gruntfile.js` and `.eslintrc`; they are just not under version control, except in *this* package.
3.  Scans `.gitignore` for the symlinked files and adds an entry if not found.  The same rule as in #1 applies; if `digs-dev` detects a `.git` folder, your working copy will be modified.

Any existing file which does *not* happen to be a symlink which `digs-dev` wants to overwrite will be skipped.  That means packages can override these files simply by adding them to version control (and removing their entries from `.gitignore`).

The `install` command runs three other commands, corresponding to the above list, in series:

1.  `upgrade` (`digs-dev upgrade`)
2.  `symlink` (`digs-dev symlink`)
3.  `gitignore` (`digs-dev gitignore`)

If you just want to re-run one of these, they are available.

## Author

[Christopher Hiller](https://boneskull.com)

## License

MIT

