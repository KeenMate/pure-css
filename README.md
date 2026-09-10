# @keenmate/pure-css

The KeenMate CSS **foundation** — the `--base-*` theming contract, the flexbox grid (`.pc-row` / `.pc-col`), and the
utility classes — extracted from [`@keenmate/pure-admin-core`](https://github.com/KeenMate/pure-admin)
so it can be consumed on its own.

## What's New in 1.0.0-rc08

- **Foundation-only — the `--pc-*` component layer moved to `@keenmate/pure-admin-core` (breaking)** — pure-css no longer ships `variables/_components.scss` or the component emit mixins (`output-pc-component-variables`, `output-pc-component-mode-variables`, `output-pc-alert-variables-{light,dark}`) — the whole buttons / cards / tables / modals / alerts / badges / command-palette / multiselect vocabulary. pure-css is now a true foundation: the `--base-*` bridge plus the base `--pc-*` tokens (surfaces, text, accent, links, border, role identities, palette slots, radius). SCSS consumers that `@include`d the component mixins must take them from pure-admin-core ≥ 2.9.0-rc20; consumers of the compiled `dist/css/*` are unaffected.
- **Icons — a shared, themeable `--base-icon-*` contract (13 tokens)** — `chevron`, `caret-down`/`-up`, `close`, `clear`, `remove`, `expand`, `collapse`, `add`, `edit`, `delete`, `search` (Lucide defaults), emitted as percent-encoded SVG data-URIs painted via `mask` + `background: currentColor`. One override re-skins the shell, pure-admin components, and the web components together; the shell's sidebar/navbar chevrons are now SVG masks instead of a `›` text glyph. Two disclosure models are documented — chevron *rotates one glyph*, expand/collapse *swaps two*.
- **Contract — a coherent, fully-named `--base-*` token API (WS7)** — added `--base-border-width`, the `--base-primary-*` accent aliases, `--base-secondary-*`, the `--base-text-on-<role>` set, `--base-info-bg` for role symmetry, the `--base-color-1..9` (+`-text`) brand palette aliased by `--pc-color-N`, and the non-colour scales `--base-space-*`, `--base-shadow-{sm,md,lg}`, `--base-duration-*` + `--base-ease-*`, and `--base-z-*`. `--base-disabled-bg` got its own value (`#f1f3f5`) instead of colliding with the hover surface.
- **Surfaces — hover/active split off the recessed surface** — new `--pc-hover-bg` / `--pc-active-bg` base tokens let component hover/active states read a dedicated interaction-state axis rather than borrowing the recessed `--base-subtle-bg`, which read as *raised* in several dark themes.
- **Theme — default palette rebased onto pure-admin Corporate** — `$base-*` defaults now track Corporate (accent `#0ea5e9`, slate text/surfaces, emerald/red/amber/cyan roles), with the palette sourced from `$base-color-1..9`. This changes pure-css's *un-themed* default look; themed apps are unaffected since every theme sets its own `--base-*`.
- **Shadow DOM — a new `component-reset` entry** — `./component-reset` (`dist/css/component-reset.css`) is the counterpart to `reboot` for web components: a `:host` box-sizing + inherited-typography reset pinned to `--base-*` so a host page can't bleed into a component's shadow root. No `rem` base — pair it with `base`. Brings the build to 7 artifacts.
- **Internal — `@keenmate/base-css-variables` is now the canonical `--base-*` parent** — pure-css mirrors its token list into `$base-*` SCSS, and `scripts/check-base-parity.mjs` fails the build if the emitted names drift from the contract. New tokens are authored in base-css-variables first, then mirrored here.

## What's New in 1.0.0-rc07

- **Theming — one runtime knob re-themes pure-admin components and the web components together** — before rc07 the same visual token was produced twice and independently: pure-admin's `--pc-*` component tokens were baked as compile-time literals, while the KeenMate web components read `--base-*` live, so they agreed only by coincidence and diverged the instant a theme retuned `--base-*` at runtime (every dark-mode toggle does exactly this at `.pc-mode-dark`). ~40 themed `--pc-*` tokens in `_base-css-variables.scss` (buttons, cards, inputs, checkbox, input groups, tables, modal, tooltip/popover, command palette, multiselect) were rewritten from `#{$…}` literals to the guiding-rule form `var(--base-x, #{$fallback})`. The `#{$fallback}` preserves today's compiled value so light-mode output is byte-for-byte unchanged, but each token now follows any runtime `--base-*` override — the same knob the web components already read.
- **App shell — navbar/sidebar/footer surfaces stay a distinct brand colour, deliberately not `--base-*`-derived** — the shell's surface + text tokens (`--pc-navbar-*`, `--pc-sidebar-*`, `--pc-footer-*`) are emitted as plain `#{$…}` literals, *not* `var(--base-main-bg, …)`. A theme sets the shell's brand (e.g. a yellow navbar) independently of the `--base-*` card/page palette, and since `--base-main-bg` is always emitted, deriving the navbar from it would let the base palette win and erase the brand. Standalone (`base.css`-only) rendering still works because the shell CSS resolves `var(--pc-navbar-bg, var(--base-main-bg))` — the `--base-*` floor applies only when no `--pc-*` is emitted (the rc06 contract), never as a runtime override of it.
- **Theming — gap `--base-*` tokens the web components read but pure-css never emitted** — several `--base-*` vars the components already consumed were falling through to hardcoded component defaults because pure-css didn't emit them, so they couldn't be themed. rc07 emits them: `--base-text-inverted`, `--base-checkbox-border-color`, `--base-input-border-color` (+ the `--base-input-border` shorthand), `--base-input-clear-color` / `--base-input-clear-bg-hover`, the solid role fills `--base-success-bg` / `--base-danger-bg` / `--base-warning-bg`, and `--base-rem`.
- **Surfaces — `--pc-main-bg` / `--pc-subtle-bg` naming realigned with the `--base-*` model** — `--pc-main-bg` is now the **white surface** and `--pc-subtle-bg` the **muted grey**, matching `--base-main-bg` / `--base-subtle-bg`; previously the two were inverted (`--pc-main-bg` *was* the grey canvas). pure-css's own canvas usages (reboot `body`, `.pc-layout`, scrollbars) were repointed `--pc-main-bg` → `--pc-page-bg` so the page canvas stays grey. **Downstream code reading `--pc-main-bg` / `--pc-subtle-bg` must re-check intent** — see pure-admin-core rc19.
- **Fixed — input borders finally track the theme** — `$input-border` was a hardcoded `#ced4da` (its own comment wrongly claimed it came from base); it's reconnected to `$base-input-border-color`. Also a semantic surface reconciliation so pure-admin and the web components resolve the *same* base token per surface (card/table headers + striped rows → `--base-elevated-bg`, dropdown/popover → `--base-dropdown-bg`, hover → `--base-hover-bg`).
- **Fixed — sidebar search box alignment + collapsed-rail gating** — the search input's inline padding was rebalanced (`0 $spacing-base 0 $spacing-sm`) so its magnifier lines up with the nav-row icons below it, and the collapsed-rail rules that strip the search down to the submit icon were re-scoped from `.pc-layout__sidebar--icon-collapse` to `.sidebar-hidden .pc-layout__sidebar--icon-collapse` — the mode class stays on the element while the rail is expanded, so the unscoped rules were stripping the search frame in the expanded state too.

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
| `dist/css/component-reset.css` | a `:host` reset (box-sizing + inherited typography pinned to `--base-*`) — the Shadow-DOM counterpart to reboot | building a web component: adopt it into the shadow root (e.g. `import '@keenmate/pure-css/component-reset?inline'`) so the host page can't bleed styles in; pair with `base` |
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
typography, border-radius, spacing/shadow/motion/z-index scales, and icons. The full list is
`src/scss/variables/_base.scss`.

#### Icons

`--base-icon-*` are mask-friendly SVG glyphs (Lucide defaults) for the shared UI affordances, so the
pure-css shell, pure-admin components, and the web/svelte components render the **same** marks and a
theme re-skins them in one place. Each is consumed via `mask: var(--base-icon-x); background:
currentColor`, so the glyph inherits text colour — override a token with any mask-friendly `url()` to
swap the icon set.

| Token | Glyph | Use |
| --- | --- | --- |
| `--base-icon-chevron` | stroked angle `›` | expanders / nav — **rotate-one-glyph** disclosure (points right, rotate 90° when open) |
| `--base-icon-caret-down` / `--base-icon-caret-up` | solid triangles `▾` / `▴` | static dropdown / `<select>` affordance (down) and sort-direction / upward-dropdown counterpart (up) — a caret never rotates |
| `--base-icon-close` | `✕` | dismiss a transient **surface** (dialog, panel, popover, toast) |
| `--base-icon-clear` | `✕` | clear a **field** — distinct purpose, same glyph; **follows** `--base-icon-close`, override alone to diverge |
| `--base-icon-remove` | `✕` | take an **item** out of a collection (chip / tag / row) — non-destructive; follows `--base-icon-close` |
| `--base-icon-expand` / `--base-icon-collapse` | `+` / `−` | **swap-two-glyphs** disclosure (tree nodes, accordions): show `+` when collapsed, `−` when open |
| `--base-icon-add` / `--base-icon-edit` / `--base-icon-delete` | `+` / pencil / trash | **CRUD action** verbs — create / modify / **destroy** (delete is a trash can, *not* an ✕, so it reads as destructive) |
| `--base-icon-search` | magnifying glass | search inputs, filter fields, command palette |

Two intentional distinctions:

- **Disclosure models:** **chevron rotates one glyph** (sidebar, multiselect), while **expand/collapse swaps
  two glyphs** (trees, accordions) — a component never rotates a `+` into a `−`.
- **✕ vs trash:** `close` / `clear` / `remove` are three *dismiss* purposes that share the ✕ glyph (and
  cascade off `--base-icon-close`), while `delete` is a separate *destructive* action drawn as a trash can.
  `add` shares the `+` shape with `expand` but is an independent knob (create ≠ disclosure).

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
