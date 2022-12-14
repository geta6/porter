#!/bin/bash

set -eu
export NODE_ENV=development

if [[ ! -f './.env.local' ]]; then
  echo '⚠️ `.env.local` not found, copy it.'
  exit 1
fi

eval "$(cat ./.env.local <(echo) <(declare -x))"

while read line; do
  if [ -n "$(echo $line | grep =)" ]; then
    KEY=$(echo $line | cut -d= -f1 | xargs)
    [[ -z "$(eval echo '$'$KEY)" ]] && echo "⚠️ '${KEY}' not configured."
  fi
done < "./.env.local"

next dev
