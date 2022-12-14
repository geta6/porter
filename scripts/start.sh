#!/bin/bash

set -eu
export NODE_ENV=production

yarn build
next start app
