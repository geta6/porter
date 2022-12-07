#!/bin/bash

set -eu
NODE_ENV=test

npx --no-install lint-staged
