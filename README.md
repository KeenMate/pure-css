# @keenmate/pure-css

The KeenMate CSS **foundation** — the `--base-*` theming contract, the flexbox grid (`.pc-row` / `.pc-col`), and the
utility classes — extracted from [`@keenmate/pure-admin-core`](https://github.com/KeenMate/pure-admin)
so it can be consumed on its own.

## What's New in 1.0.0-rc05

- **App shell — the navbar, sidebar, and layout container join the foundation** — pure-css has been variables + grid + utilities since the extraction; rc05 relocates the structural *app-shell* layer out of `@keenmate/pure-admin-core`, so a standalone page gets the same navbar/sidebar/layout chrome as a full admin app without pulling in the 40+ component library. Eight new partials (`_navbar.scss`, `_navbar-elements.scss`, `_sidebar.scss`, `_sidebar-states.scss`, `_layout-container.scss`, `_layout-responsive.scss`, `_resize-handle.scss`, `_fit-flyout.scss`) `@use` into the `pure-css.css` bundle — `base.css`, `grid.css` and `utilities.css` are untouched and there's no new CSS artifact. The emitted surface is `pc-`-branded like the rest of the foundation: the fixed navbar (`.pc-navbar` + `__start`/`__center`/`__end`, burger, brand `.pc-app-header`, `.pc-navmenu`, profile button, theme switcher), the nested sidebar with hidden/icon-collapse/expanded states and a drag-to-resize handle (`.pc-sidebar`, `.pc-layout__sidebar`, `.pc-sidebar-resize`), and the layout wrapper (`.pc-layout` + `__main`/`__content`/`__footer`) with mobile/tablet media queries. pure-admin-core now `@forward`s same-named partials instead of owning copies, so the shell is single-sourced here and can't drift.
- **The shell now brings its own behaviour — pure-css is no longer CSS-only** — the shell's JavaScript ships with the foundation as a small, dependency-free runtime under `src/js/`, exposed as source (no build step) via a new `./js` export. `pure-css.js` installs `window.pureCss` — an event bus, live viewport / OS-colour-scheme / capability-first device sources, overlay primitives (scroll-lock, keyboard-inset), an open-menu registry, a shared `config` baseline single-sourced from the SCSS via `--pc-*` vars, and `components.initAll(scope)` — and the shell engines hang off it: `fit.js` (the `data-pc-fit` fit engine, which also absorbed the former `navbar-collapse.js` progressive nav-folding via `data-pc-fit-nav`, so that file no longer exists), `navbar-dropdown.js`, `sidebar-resize.js`, and `container-breakpoint.js`. The runtime is load-order-safe and stands alone when pure-admin is absent; the shell CSS is authored no-JS-safe, so styling degrades gracefully rather than breaking when the runtime isn't loaded.
- **The grid's automatic responsive context now ships in the same bundle** — `_pa-grid.scss`'s container-query responsive columns (`.pc-col-md-*`, …) need a containment-context ancestor, documented as `.pc-layout__main`. That selector previously lived only in pure-admin-core, so the note was aspirational for a standalone pure-css page; with `_layout-container.scss` relocated into the bundle, `.pc-layout__main` is emitted here and the responsive variants get their context out of the box (the stale comment still read `.pa-layout__main` from before the rc04 de-brand — corrected to `.pc-layout__main`).
- **Toolchain-free zip distribution via GitHub Releases** — a new `.github/workflows/release.yml` builds the CSS on every `v*.*.*` tag push and publishes a GitHub Release carrying `pure-css-<version>.zip` (the same file set as the npm package — `dist/`, `src/scss/`, `README.md`, `CHANGELOG.md`, `LICENSE`) plus a `.sha256` checksum, so consumers who don't use npm can vendor the built foundation as a drop-in. rc tags (those containing `-`) publish as GitHub pre-releases. Mirrors pure-admin-core's release workflow, adapted for this single-package repo.

## What's New in 1.0.0-rc04

- **pure-css is now strictly a base — it emits only the base token contract
  (BREAKING).** `base.css` / `pure-css.css` ship the ~46 base `--pc-*` tokens the
  foundation actually uses or exposes as universal primitives; the ~165 component
  tokens (buttons, cards, tables, alerts, panels, …) are pure-admin's contract,
  emitted by the new `output-pc-component-variables` mixin. If you author themes
  or call the emit mixins, add `@include output-pc-component-variables;` after
  `output-pc-css-variables`. Consumers of compiled CSS are unaffected.
- **The foundation namespace is fully de-branded from `pa` to `pc` (BREAKING).**
  pure-css was carved out of pure-admin, so it still carried pure-admin's `pa`
  brand in its public surface. That's gone:
  - **Grid + mode classes:** `.pa-row` / `.pa-col*` / `.pa-offset*` / `.pa-cq` /
    `.pa-hide*` / `.pa-show*` → `.pc-*`; `.pa-mode-light` / `.pa-mode-dark` →
    `.pc-mode-*`.
  - **Every emitted CSS variable:** the whole `--pa-*` runtime surface (~210
    custom properties) → `--pc-*` (`--pa-accent` → `--pc-accent`, `--pa-card-bg`
    → `--pc-card-bg`, `--pa-color-1..9` → `--pc-color-1..9`, …). `--base-*`
    (web-component bridge) and `--page-loader-*` are unchanged.
  - **The emit mixins:** `output-pa-css-variables` → `output-pc-css-variables`,
    `output-pa-alert-variables-light/dark` → `output-pc-alert-variables-*`.
  Consumers migrate markup, `var()` reads, inline `style="--pa-…"`, and theme
  `:root` blocks in lockstep — a boundary-aware find/replace of the string
  `--pa-` → `--pc-` (safe: it can't touch `--base-*`, `--page-loader-*`, or the
  `.pa-color-{name}` variant **class**).
- **Sizing utilities consolidated into the foundation.** The universal
  viewport-height utilities (`h-full` / `h-screen` / `min-h-full` /
  `min-h-screen` / `max-h-full` / `max-h-screen`) and the Tailwind-style flex
  shorthands (`flex-1` / `flex-auto` / `flex-initial` / `flex-none` /
  `flex-grow` / `flex-shrink`) now ship from pure-css, so a standalone page gets
  the complete set without borrowing anything from pure-admin. pure-admin's
  duplicate rem-height `h-Nx` / `min-h-Nx` / `max-h-Nx` classes are retired in
  favour of the foundation's `hr-` / `wr-` naming (`r` = rem).
- **Complete form-spacing contract as runtime `--pc-*` variables** and the
  `$form-scale` → `$form-gap` rename (see CHANGELOG).

## Why

Any surface that isn't a full admin app — a docs site, a marketing page, a standalone widget host —
wants the *foundation* (variables + grid + utilities) without pure-admin-core's 40+ components. And
every KeenMate web component (`<web-multiselect>`, …) and Svelte component already reads its colors
from the `--base-*` custom properties. Shipping those from one small package means one theming layer
that the components, the admin framework, and everything else all agree on.

```
@keenmate/pure-css              @keenmate/pure-admin-core
  ├─ --base-* variables    ◀────  imports pure-css, adds
  ├─ .pc-row / .pc-col grid       the component library
  └─ utility classes
        ▲
        └── docs sites, portals, component hosts consume the built CSS directly
```

## Installation

```bash
npm install @keenmate/pure-css
```

## Quick Start

**Prebuilt CSS (simplest):**

```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-css/dist/css/pure-css.css">
```

or cherry-pick:

```html
<link rel="stylesheet" href="…/pure-css/dist/css/base.css">   <!-- variables only -->
<link rel="stylesheet" href="…/pure-css/dist/css/grid.css">   <!-- + grid          -->
```

**SCSS (customize before compiling):**

```scss
// Override the source of truth; everything re-derives.
$base-accent-color: #4f46e5;
$base-page-bg: #0b1020;

@use '@keenmate/pure-css/scss/pure-css';
```

## What's in it

| Artifact | Contents | When to link |
| --- | --- | --- |
| `dist/css/pure-css.css` | everything below, in one file | the common case |
| `dist/css/base.css` | only `:root { --base-*; --pc-*; }` | you just need the theming contract (e.g. to theme embedded web components) or a base for a theme override |
| `dist/css/grid.css` | `.pc-row` / `.pc-col-*` (percentage + fraction columns, container-query responsive) | layout only |
| `dist/css/utilities.css` | spacing / flex / display / width-height utilities (`.m-4`, `.d-flex`, `.w-50`, …) | utilities only |

The `pure-css.css` bundle also includes the **app shell** (navbar, sidebar,
layout container) — `base.css` / `grid.css` / `utilities.css` do not.

### The app-shell runtime (`./js`)

The shell's behaviour (nav fit/collapse, dropdowns, drag-to-resize, container
breakpoints) ships as dependency-free source JS via the `./js` export — no
bundler required, drop it in with a `<script>` and call `initAll`:

```html
<link rel="stylesheet" href="node_modules/@keenmate/pure-css/dist/css/pure-css.css">
<script src="node_modules/@keenmate/pure-css/src/js/pure-css.js"></script>
<script src="node_modules/@keenmate/pure-css/src/js/fit.js"></script>
<script src="node_modules/@keenmate/pure-css/src/js/navbar-dropdown.js"></script>
<script src="node_modules/@keenmate/pure-css/src/js/sidebar-resize.js"></script>
<script>window.pureCss.components.initAll(document);</script>
```

`window.pureCss` also exposes an event bus and live `viewport` / `colorScheme` /
`device` sources. The runtime is optional — shell CSS is authored no-JS-safe, so
the styling stands on its own and the JS only adds the interactive behaviour.

### The `--base-*` contract

`--base-*` is the **single source of truth for theming**. Framework colors, component variables
(`--pc-*`) and web/svelte components all derive from it via fallback chains
(`--ms-accent-color: var(--base-accent-color, #3b82f6)`). Categories: accent, text, background,
border, input, dropdown, tooltip, contextual (success/danger/warning/info), interactive states,
typography, border-radius. The full list is `src/scss/variables/_base.scss`.

## Theming

A **theme** is nothing but a set of `--base-*` values. The lightest possible theme is a stylesheet
that redeclares them, loaded *after* `base.css`:

```css
:root {
  --base-accent-color: #4f46e5;
  --base-page-bg: #f6f8fb;
  --base-text-color-1: #1a2233;
}
```

Because pure-admin-core, the components and any consumer all read the same variables, that one block
re-themes all of them at once. This is the same model as
[`@keenmate/pure-admin-themes`](https://github.com/KeenMate/pure-admin-themes), so the same CLI and
publishing infrastructure applies.

## Build

```bash
make install   # sass
make build     # src/scss -> dist/css (bundle + base + grid + utilities)
make sizes     # show artifact sizes
```

`dist/` is committed so consumers can vendor the built CSS without a Sass toolchain.

## Provenance

The SCSS is the foundation extracted from `pure-admin-core`'s `src/scss` — the `variables/` modules,
`_base-css-variables.scss`, `utilities.scss`, `_fonts.scss`, and the native grid (`_pa-grid.scss`,
formerly core's `core-components/_grid.scss`). **pure-admin-core now consumes this package** as its
single source for the foundation (thin `@import`/`@forward` shims), so the two no longer drift —
core's compiled `--base-*` values and grid output match pure-css exactly.

One intentional difference: `utilities.scss` here `@use`s `_fonts.scss` so the generic
`.font-family-*` classes ship with the other utilities, whereas core keeps `_fonts.scss` standalone.
`_rtl-helpers.scss` and the component layer stay in core.

## License

MIT © KeenMate. The grid is derived from [Pure](https://purecss.io/) (Yahoo!, BSD).
