#!/bin/bash
#
# Upgrades devDependencies of all locally installed digs-related packages
# (relative to a directory)

CWD=`pwd`
ROOT=${1:-${CWD}}
cd ${ROOT}
echo "Looking for Digs-related packages in ${ROOT}..."

[[ ! *digs* ]]
for DIR in *digs*
do
  [[ -d ${DIR} && ${DIR} != digs-dev ]] && {
    cd ${DIR}
    [[ `grep 'digs-dev install' package.json` ]] && {
      echo "Upgrading `basename ${DIR}`"
      npm run prepublish
    }
    cd ..
  }
done

cd ${CWD}
