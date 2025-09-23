#!/usr/bin/env bash

# Preload base bash configuration and functions
source bgord-scripts/base.sh
setup_base_config

OUTPUT_DIRECTORY="dist"

info "Clearing output directory..."
rm -rf $OUTPUT_DIRECTORY
success "Output directory cleared"

info "Building package..."
tsc --build
success "Package built correctly!"
