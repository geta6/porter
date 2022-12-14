#!/bin/bash

set -eu

if [ ! -h ".git/hooks/pre-commit" ]; then
  ln -sf "scripts/precommit.sh" ".git/hooks/pre-commit"
fi

if [ ! -f ".envrc" -a -x "`which direnv`" ]; then
  echo 'export PATH="$(npm bin):$PATH"' > ".envrc"
  direnv allow
fi

if [ ! -f ".env.local" ]; then
  cp -v ".env.example" ".env.local"
fi
