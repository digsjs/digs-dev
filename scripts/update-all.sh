#!/bin/bash
#
# Upgrades devDependencies of all locally installed digs-related packages
# (relative to a directory)

CWD=`pwd`
ROOT=${1:-${CWD}}
cd ${ROOT}
echo "Looking for Digs-related packages in ${ROOT}"

[[ ! *digs* ]] && {
  echo "Can't find anything."
}

function isValid {
  local DIR="${1}"
  [[ -d ${DIR} && \
    ${DIR} != digs-dev && \
    -e ${DIR}/package.json && \
    `grep 'digs-dev install' ${DIR}/package.json` ]] && return 0
  return 1
}

function cleanup {
  npm prune
  for MODULE in node_modules/*
  do
    [[ -h ${MODULE} ]] && npm unlink ${MODULE}
  done;
}

function upgrade {
  npm install --production
  npm link digs-dev
  npm install
  grunt devUpdate:auto
}

for DIR in *digs*
do
   [[ isValid ${DIR} ]] && {
      cd ${DIR}
      cleanup
      upgrade
      cd -
    }
done

cd ${CWD}
