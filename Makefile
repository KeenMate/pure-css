# @keenmate/pure-css - Makefile
# Build the CSS foundation (base variables + grid + utilities) from SCSS.
#
# Usage:
#   make setup          Install dependencies and build
#   make install        Install dependencies (sass)
#   make build          Compile src/scss -> dist/css (bundle + base + grid + utilities)
#   make watch          Rebuild the bundle on change
#   make clean          Remove dist/css
#   make sizes          Show built artifact sizes
#   make package        Create npm tarball
#   make verify         Clean, build, and verify package
#   make publish-dry    Dry-run publish as 'latest' (verify what would be published)
#   make publish-dry-rc Dry-run publish under --tag rc (for pre-releases)
#   make publish        Publish to npm as 'latest'
#   make publish-rc     Publish under --tag rc (canonical for X.Y.Z-rcN)
#   make publish TAG=<x> Publish under arbitrary dist-tag (e.g. TAG=beta, TAG=next)

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

# NPM publish tag (empty for latest, use TAG=rc for pre-releases)
TAG ?=
NPM_TAG = $(if $(TAG),--tag $(TAG),)

.PHONY: help setup install build watch clean sizes package verify publish-dry publish-dry-rc publish publish-rc

help:
	@echo "@keenmate/pure-css - Available Commands:"
	@echo ""
	@echo "  Setup:"
	@echo "    make setup          - Install dependencies and build"
	@echo ""
	@echo "  Build:"
	@echo "    make install        - Install dependencies"
	@echo "    make build          - Compile src/scss to dist/css"
	@echo "    make watch          - Rebuild bundle on change"
	@echo "    make clean          - Remove dist/css"
	@echo "    make sizes          - Show built artifact sizes"
	@echo ""
	@echo "  Package:"
	@echo "    make package        - Create npm tarball"
	@echo "    make verify         - Clean, build, and verify package"
	@echo "    make publish-dry    - Dry-run publish as 'latest'"
	@echo "    make publish-dry-rc - Dry-run publish under --tag rc"
	@echo "    make publish        - Publish to npm as 'latest'"
	@echo "    make publish-rc     - Publish under --tag rc (canonical for X.Y.Z-rcN)"
	@echo "    make publish TAG=x  - Publish under arbitrary dist-tag"
	@echo ""

# Full setup - install and build
setup: install build

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

# Create package tarball (clean + build first)
package: clean build
	npm pack

# Verify package (clean + build + pack)
verify: clean build
	npm pack
	@echo "Package verified and ready!"

# Dry-run publish as 'latest' (clean + build + verify what would be published)
publish-dry: clean build
	npm publish --dry-run $(NPM_TAG)

# Dry-run publish under --tag rc (for pre-release versions like X.Y.Z-rcN)
publish-dry-rc: clean build
	npm publish --dry-run --tag rc

# Publish to npm as 'latest' (clean + build first)
publish: clean build
	npm publish $(NPM_TAG)

# Publish under --tag rc (canonical for X.Y.Z-rcN pre-releases). Keeps the
# 'latest' dist-tag untouched; consumers opt in via @rc or by pinning the exact
# version. Equivalent to `make publish TAG=rc` but harder to forget.
publish-rc: clean build
	npm publish --tag rc
