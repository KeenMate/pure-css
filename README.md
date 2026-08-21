# @keenmate/pure-css

The KeenMate CSS **foundation** — the `--base-*` theming contract, the flexbox grid (`.pa-row` / `.pa-col`), and the
utility classes — extracted from [`@keenmate/pure-admin-core`](https://github.com/KeenMate/pure-admin)
so it can be consumed on its own.

## What's New in 1.0.0-rc03

- **Theming contract — top-bar region tokens renamed from `header` to `navbar` (BREAKING).** The foundation's top-region tokens named the bar as a *component block* (`header`) rather than the layout region it actually is, which read as misleading once pure-admin's navbar component dropped its legacy `pa-header__*` block naming. Every top-bar token is renamed on both sides of the cascade: the `$header-*` SCSS source variables (`$header-height` → `$navbar-height`, `$header-bg` → `$navbar-bg`, `$header-border-color`, `$header-text`, `$header-text-secondary`, `$header-profile-name-color`, and `$z-index-header` → `$z-index-navbar`) and the emitted `--pa-header-*` custom properties (`--pa-navbar-bg`, `--pa-navbar-border-color`, `--pa-navbar-text`, `--pa-navbar-text-secondary`, `--pa-navbar-profile-name-color`). Consumers reading the old names must update — `$footer-height` still mirrors the bar height (now `$navbar-height`), and the component-header tokens (`$card-header-*`, `$table-header-*`) are deliberately untouched since those *are* component blocks.
- **Removed the dead `$header-brand-padding-left` variable.** It was superseded by the navbar's flex `gap`; no live rule consumed it — only a stale comment still referenced it — so it's gone from the source of truth.

## What's New in 1.0.0-rc02

- **Reboot layer — the 10px base is now built in.** pure-css ships
  `html { font-size: 10px }` (plus a `box-sizing` reset and neutral base element
  styling) via the new `reboot.scss`, included in the `pure-css.css` bundle and
  available standalone as `reboot.css` / the `./reboot` export. Every pure-css
  rem value assumes a 10px root, so previously a standalone consumer rendered
  everything 1.6× too large until they added the base themselves — now it just
  works out of the box.
- **Themed scrollbars, foundation-wide.** The global thin-scrollbar styling
  (`scrollbars.scss`, coloured from the `--pa-*` cascade) moved out of
  pure-admin-core, so a standalone pure-css page gets the same scrollbars as a
  full admin app. In the bundle, or cherry-pick `scrollbars.css` / `./scrollbars`.

## Why

Any surface that isn't a full admin app — a docs site, a marketing page, a standalone widget host —
wants the *foundation* (variables + grid + utilities) without pure-admin-core's 40+ components. And
every KeenMate web component (`<web-multiselect>`, …) and Svelte component already reads its colors
from the `--base-*` custom properties. Shipping those from one small package means one theming layer
that the components, the admin framework, and everything else all agree on.

```
@keenmate/pure-css              @keenmate/pure-admin-core
  ├─ --base-* variables    ◀────  imports pure-css, adds
  ├─ .pa-row / .pa-col grid       the component library
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
| `dist/css/base.css` | only `:root { --base-*; --pa-*; }` | you just need the theming contract (e.g. to theme embedded web components) or a base for a theme override |
| `dist/css/grid.css` | `.pa-row` / `.pa-col-*` (percentage + fraction columns, container-query responsive) | layout only |
| `dist/css/utilities.css` | spacing / flex / display / width-height utilities (`.m-4`, `.d-flex`, `.w-50`, …) | utilities only |

### The `--base-*` contract

`--base-*` is the **single source of truth for theming**. Framework colors, component variables
(`--pa-*`) and web/svelte components all derive from it via fallback chains
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
