# @keenmate/pure-css - Makefile
# Build the CSS foundation (base variables + grid + utilities) from SCSS.
#
# Usage:
#   make install    Install dependencies (sass)
#   make build      Compile src/scss -> dist/css (bundle + base + grid + utilities)
#   make watch      Rebuild the bundle on change
#   make clean      Remove dist/css
#   make sizes      Show built artifact sizes

# --- Windows recipe-shell fix -------------------------------------------------
# GNU make on Windows picks Git's bare `usr/bin/sh.exe` as the recipe shell,
# which breaks npm/npx's Unix shell-shims. Pin the recipe shell to Git's full
# bash launcher so `env bash` resolves to MSYS bash. Guarded so it's a no-op
# when Git isn't at the default location. (Mirrors pure-admin-themes.)
ifeq ($(OS),Windows_NT)
  ifneq ($(wildcard C:/Program?Files/Git/bin/bash.exe),)
    SHELL := C:/Program Files/Git/bin/bash.exe
  endif
endif
# -----------------------------------------------------------------------------

.PHONY: help install build watch clean sizes

help:
	@echo @keenmate/pure-css
	@echo ""
	@echo   make install   Install dependencies
	@echo   make build     Compile src/scss to dist/css
	@echo   make watch     Rebuild bundle on change
	@echo   make clean     Remove dist/css
	@echo   make sizes     Show built artifact sizes
	@echo ""

install:
	npm install

build:
	npm run build

watch:
	npm run watch

clean:
	rm -rf dist/css

sizes: build
	@ls -l dist/css/*.css | awk '{printf "  %8d  %s\n", $$5, $$9}'
