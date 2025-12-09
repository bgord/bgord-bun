#!/usr/bin/env bash

source bgord-scripts/base.sh
setup_base_config

OUTPUT_DIRECTORY="dist"

step_start "Directory clear"
rm -rf $OUTPUT_DIRECTORY
step_end "Directory clear"

step_start "Package build"
bunx tsc --build
step_end "Package build"
