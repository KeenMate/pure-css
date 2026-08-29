# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@keenmate/pure-css` is the KeenMate CSS **foundation** — the `--base-*` theming
contract, the `.pc-row` / `.pc-col` flexbox grid, and the utility classes —
extracted from [`@keenmate/pure-admin-core`](https://github.com/KeenMate/pure-admin)
so it can be consumed standalone. As of 1.0.0-rc05 it also carries the **app
shell** (navbar, sidebar, layout container) and a small, dependency-free **JS
runtime** (`window.pureCss` plus the fit / navbar-dropdown / sidebar-resize /
container-breakpoint engines) that drives the shell's behaviour — so the
foundation is no longer CSS-only. The SCSS still compiles to `dist/css`; the JS
ships **as source** (`src/js/`, no build step) via the `./js` export. There is a
Playwright e2e suite (`e2e/`) but no runtime dependency beyond `sass`.
`pure-admin-core` now consumes this package as its single source for the
foundation (the shell + runtime included, via `@forward` shims), so the two must
not drift.

## Commands

```bash
make build      # or: npm run build — compile src/scss -> dist/css (all 6 artifacts)
make watch      # rebuild the bundle on change (npm run watch)
make sizes      # build, then print artifact byte sizes
make verify     # clean + build + npm pack (what would be published)
make publish-rc # publish X.Y.Z-rcN under the `rc` dist-tag (does NOT move `latest`)
make publish    # publish as `latest`
```

Each output file has its own `build:*` npm script (e.g. `npm run build:grid`),
all thin `sass src/scss/<x>.scss dist/css/<x>.css` wrappers. To rebuild one
artifact after editing its source, run that single script rather than the full
`build`.

`dist/` is **committed** — consumers vendor the built CSS without a Sass
toolchain, so any SCSS change must be followed by a rebuild and the regenerated
`dist/` committed alongside it. Building requires no `npm install` beyond `sass`.

Note on Windows: the Makefile pins the recipe shell to Git's full `bash.exe`
because GNU make otherwise picks a bare `sh.exe` that breaks npm/npx shims.

## Architecture

### The theming cascade — single source of truth

The core idea: **one block of variable overrides re-themes everything.**

1. `src/scss/variables/_base.scss` defines `$base-*` SCSS variables (accent,
   text, background, border, input, typography, radius…). These are the
   **source of truth**, all declared with `!default`.
2. Other `variables/*` modules (`_colors`, `_typography`, `_components`, …)
   **derive** framework values from `$base-*`.
3. `_base-css-variables.scss` emits those as CSS custom properties at `:root`.
   It defines four mixins but **the foundation bundle only calls the first two**:
   - `output-base-css-variables` — the `--base-*` web-component bridge.
   - `output-pc-css-variables` — the **base** `--pc-*` tokens ONLY (surfaces,
     text, accent, links, border, the semantic role identities + their utility
     text colours, the theme palette slots, the radius scale). This is pure-css's
     whole runtime contract.
   - `output-pc-component-variables` + `output-pc-alert-variables-{light,dark}` —
     the **component** `--pc-*` tokens (buttons, cards, tables, alerts, badges,
     panels, command palette, multiselect, sentiment scale, form spacing, …).
     These are **pure-admin's** contract: defined here (they read the shared
     `$`-variable vocabulary, so they must be authored where it's in scope) but
     **NOT emitted by pure-css's own bundles** — `base.scss` / `pure-css.scss`
     don't call them. Consumers that ship the components opt in.
4. Downstream web/svelte components read them through fallback chains
   (`--ms-accent-color: var(--base-accent-color, #3b82f6)`).

A **theme** is nothing more than a set of `--base-*` values (or `$base-*`
overrides compiled in). Because pure-admin-core, its `--pc-*` component
variables, and every KeenMate component all read the same variables, overriding
`--base-*` re-themes all of them at once.

### The `@import` / `!default` mechanism (important, do not "fix")

`variables/_index.scss` uses `@import` (not `@forward`) **on purpose** so all
variable modules share one global scope. This lets a theme set `$base-*` values
*before* importing, and the `!default` flags skip the already-defined ones. When
`_base-css-variables.scss` needs the vars under a `@use` module loader, it
`@use 'variables/index' as *` — Sass hoists those members into the importer's
global scope where theme overrides already live. Order in `_index.scss` matters:
`base` first, then the modules that derive from it.

### Entry points → dist artifacts

Each top-level `src/scss/*.scss` compiles to one `dist/css/*.css`, mirrored by
the package `exports` map:

| Source | Output | Emits |
| --- | --- | --- |
| `pure-css.scss` | `pure-css.css` | everything (the common bundle) |
| `base.scss` | `base.css` | only `:root` `--base-*`/`--pc-*` defaults |
| `reboot.scss` | `reboot.css` | `html { font-size: 10px }` + box-sizing reset + neutral element styling |
| `scrollbars.scss` | `scrollbars.css` | themed thin scrollbars (colored from `--pc-*`) |
| `grid.scss` | `grid.css` | `.pc-row` / `.pc-col-*` (via `_pa-grid.scss`) |
| `utilities.scss` | `utilities.css` | spacing / flex / display / width-height / `.font-family-*` |

Partials (`_`-prefixed) are shared building blocks: `_base-css-variables.scss`,
`_pa-grid.scss`, `_fonts.scss`, the app-shell partials (`_navbar*`, `_sidebar*`,
`_layout-*`, `_resize-handle`, `_fit-flyout`), and everything under `variables/`.

### The app shell + JS runtime

The **app shell** — navbar (`_navbar.scss`, `_navbar-elements.scss`), sidebar
(`_sidebar.scss`, `_sidebar-states.scss`), layout container
(`_layout-container.scss`, `_layout-responsive.scss`), the shared resize-handle
mixin (`_resize-handle.scss`, mixin-only, emits nothing), and the fit-engine
flyout sink (`_fit-flyout.scss`) — is `@use`d into the **`pure-css.css` bundle
only**. It is *not* part of `base.css` / `grid.css` / `utilities.css`, and there
is no standalone shell artifact.

Its **behaviour** lives in `src/js/`, shipped as source (no build) via the
`./js` export — `pure-css.js` installs the `window.pureCss` runtime (event bus,
viewport / colour-scheme / device sources, overlay primitives, open-menu
registry, shared `config`, `components.initAll`) and the engines hang off it:
- `fit.js` — the Fit engine (`data-pc-fit`); it also absorbed the former
  `navbar-collapse.js` (nav folding via `data-pc-fit-nav`), so there is **no
  `navbar-collapse.js`** — comments/markup naming it are stale.
- `navbar-dropdown.js` — tap-toggle nav dropdowns/submenus (`.is-open`).
- `sidebar-resize.js` — drag-to-resize the sidebar.
- `container-breakpoint.js` — container-query breakpoint driver.

The runtime is load-order-safe (`window.pureCss = window.pureCss || {}`) and
stands alone when pure-admin is absent; `pure-admin.js` adopts the same buses by
reference when it loads on top. Shell CSS is authored **no-JS-safe** (static
fallbacks), so the styling degrades rather than breaks without the runtime.

### Key contracts to preserve

- **10px rem base.** Every rem value assumes `html { font-size: 10px }` from
  `reboot.scss`. The spacing scale in `utilities.scss` (`$spacers`, `1: 0.25rem`
  = 4px … `20: 5rem` = 80px) depends on this.
- **The grid** (`_pa-grid.scss`) is flexbox columns in 5% increments plus
  fractions (`.pc-col-1-3`, `.pc-col-2-3`), with container-query responsive
  variants (`.pc-col-md-*`) and RTL-aware gutters. It replaced the legacy Pure
  `.pure-g` / `.pure-u-*` grid.
- Border/rounded utilities consume the emitted `--pc-border-*` variables so
  `base.css` + `utilities.css` render correct borders standalone.

### Provenance / drift

The SCSS was extracted from pure-admin-core's `src/scss`. One intentional
difference: `utilities.scss` here `@use`s `_fonts.scss` so `.font-family-*`
ships with the utilities, whereas core keeps `_fonts.scss` standalone.
`_rtl-helpers.scss` and the component layer stay in core. When changing shared
variables or grid output, keep parity with core in mind — the compiled values
are expected to match.

**Consumers.** Two known consumers share this one `--base-*` layer:
`pure-admin-core` (uses pure-css as its foundation source) and `keen-docs`
(the docs site, sibling repo `../keen-docs` — a concrete instance of the
"docs site" case and a driving reason for the extraction). Changes to shared
variables, the grid, or utility output affect both.
