#!/bin/bash

set -eu
BASEDIR=$(dirname $0)

if [ ! -h "${BASEDIR}/../.git/hooks/pre-commit" ]; then
  ln -sf "${BASEDIR}/precommit.sh" "${BASEDIR}/../.git/hooks/pre-commit"
fi

if [ ! -f "${BASEDIR}/../.envrc" -a -x "`which direnv`" ]; then
  echo 'export PATH="$(npm bin):$PATH"' > "${BASEDIR}/../.envrc"
  direnv allow
fi

if [ ! -f "${BASEDIR}/../app/.env.local" ]; then
  cp -v "${BASEDIR}/../.env.example" "${BASEDIR}/../app/.env.local"
fi
