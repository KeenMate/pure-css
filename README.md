# @keenmate/pure-css

The KeenMate CSS **foundation** — the `--base-*` theming contract, the PureCSS grid, and the
utility classes — extracted from [`@keenmate/pure-admin-core`](https://github.com/KeenMate/pure-admin)
so it can be consumed on its own.

Any surface that isn't a full admin app — a docs site, a marketing page, a standalone widget host —
wants the *foundation* (variables + grid + utilities) without pure-admin-core's 40+ components. And
every KeenMate web component (`<web-multiselect>`, …) and Svelte component already reads its colors
from the `--base-*` custom properties. Shipping those from one small package means one theming layer
that the components, the admin framework, and everything else all agree on.

```
@keenmate/pure-css              @keenmate/pure-admin-core
  ├─ --base-* variables    ◀────  imports pure-css, adds
  ├─ PureCSS grid                 the component library
  └─ utility classes
        ▲
        └── docs sites, portals, component hosts consume the built CSS directly
```

## What's in it

| Artifact | Contents | When to link |
| --- | --- | --- |
| `dist/css/pure-css.css` | everything below, in one file | the common case |
| `dist/css/base.css` | only `:root { --base-*; --pa-*; }` | you just need the theming contract (e.g. to theme embedded web components) or a base for a theme override |
| `dist/css/grid.css` | `.pure-g` / `.pure-u-*` + responsive units | layout only |
| `dist/css/utilities.css` | spacing / flex / display / width-height utilities (`.m-4`, `.d-flex`, `.w-50`, …) | utilities only |

### The `--base-*` contract

`--base-*` is the **single source of truth for theming**. Framework colors, component variables
(`--pa-*`) and web/svelte components all derive from it via fallback chains
(`--ms-accent-color: var(--base-accent-color, #3b82f6)`). Categories: accent, text, background,
border, input, dropdown, tooltip, contextual (success/danger/warning/info), interactive states,
typography, border-radius. The full list is `src/scss/variables/_base.scss`.

## Usage

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

The SCSS is extracted verbatim from `pure-admin-core`'s `src/scss` (`variables/`,
`_base-css-variables.scss`, `_purecss-grid*.scss`, `utilities.scss`). Compiled values are identical
to core's `dist/css/main.css`. Keep the two in sync when the foundation changes.

## License

MIT © KeenMate. The grid is derived from [Pure](https://purecss.io/) (Yahoo!, BSD).
