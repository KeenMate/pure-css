# Changelog

All notable changes to `@keenmate/pure-css` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] — 2026-08-04

Initial extraction of the CSS foundation out of `@keenmate/pure-admin-core`.

### Fixed

- **Border/rounded utilities now resolve (were inert).** `.border` / `.border-{top,right,bottom,left}`
  and `.rounded` / `.rounded-{lg,top,…}` referenced bare `--border-color` / `--border-radius`
  variables the framework never emits — so they fell back to a `currentColor` border and no radius
  (a latent bug inherited from pure-admin-core). Repointed them at the emitted `--pa-border-color` /
  `--pa-border-radius(-lg)` (themed from `--base-*`). Now `base.css` + `utilities.css` are
  **self-sufficient** — the border/radius utilities work standalone, no host shim.
- **`--pa-border-color` is now a live reference** — emitted as `var(--base-border-color, <literal>)`
  instead of a baked literal (it's a pure pass-through, no derivation lost). So it — and the `.border`
  utilities that read it — follow a **runtime** `--base-border-color` override (a theme or dark-mode
  class toggling it at `:root`/`.pa-mode-dark`), not just build-time themes.

### Added

- **`--base-*` theming contract** — `src/scss/variables/*` (the `$base-*` source of truth plus the
  derived typography/spacing/colors/layout/system/components modules) and
  `_base-css-variables.scss` (the mixin emitting `--base-*` and derived `--pa-*` custom properties).
- **PureCSS grid** — `_purecss-grid.scss` + `_purecss-grid-responsive.scss` (`.pure-g` / `.pure-u-*`).
- **Utilities** — `utilities.scss` (spacing / flex / display / width-height classes) plus the generic
  `.font-family-system/-sans/-serif/-mono` classes from `_fonts.scss` (core keeps `_fonts.scss`
  standalone; here it `@use`s into utilities so all foundation utilities ship together). Adds
  `.gap-*` / `.gap-x-*` / `.gap-y-*` (flex/grid gap, same `$spacers` scale) — the one spacing family
  core lacked, needed to express flex layouts with utilities.
- **Build entries & artifacts** — `pure-css.scss` (full bundle), `base.scss` (variables only),
  `grid.scss` (grid only), and the existing `utilities.scss`, compiled to
  `dist/css/{pure-css,base,grid,utilities}.css`. `dist/` is committed for toolchain-free vendoring.
- Package tooling: `package.json` (`@keenmate/pure-css`, `exports` for `.`/`./base`/`./grid`/
  `./utilities`/`./scss`), `Makefile`, `README`, this changelog.

### Notes

- The SCSS is a **verbatim copy** of pure-admin-core's foundation; compiled `--base-*` values match
  core's `dist/css/main.css` exactly. pure-admin-core still carries its own copy for now — de-duping
  core to consume this package is a follow-up.
