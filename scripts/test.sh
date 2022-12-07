#!/bin/bash

set -eu
export NODE_ENV=test

jest $@
