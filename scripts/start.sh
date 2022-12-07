#!/bin/bash

set -eu
export NODE_ENV=production
export PORT=4000

next build app
next start app
