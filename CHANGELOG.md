# Changelog

All notable changes to `@keenmate/pure-css` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0-rc06] — 2026-08-30

### Fixed

- **The app shell now renders standalone — component `--pc-*` tokens fall back to
  `--base-*`.** rc05 relocated the shell into the foundation, but its CSS
  hard-referenced component tokens (`--pc-navbar-bg`, `--pc-sidebar-*`,
  `--pc-footer-*`, `--pc-card-bg`, `--pc-input-bg`) that pure-css does **not**
  emit — those are pure-admin's `output-pc-component-variables` contract. So a
  consumer linking `base.css` / `pure-css.css` alone (keen-docs hit this) got an
  unstyled navbar/sidebar. Every such reference now carries a `--base-*` fallback
  traced from the token's own derivation: `var(--pc-navbar-bg, var(--base-main-bg))`,
  `var(--pc-sidebar-bg, var(--base-page-bg))`, navbar/sidebar text →
  `--base-text-color-1/2`, borders → `--base-border-color`, submenu surfaces →
  `--base-subtle-bg`, input → `--base-input-bg`. This makes `--pc-*` an *optional*
  override layer over a guaranteed `--base-*` floor — link only the base vars and
  the shell just works; set `--pc-navbar-bg` to tune the bar independently of the
  page. 40 references across the eight shell partials.
- **Dangling token references in `_fit-flyout.scss`.** The fit-flyout trigger
  referenced `--pc-accent-color` (defined nowhere — the token is `--pc-accent`)
  with no fallback, so its focus outline was inert; and `--pc-hover-bg` (also
  undefined) with only an rgba literal. Repointed to
  `var(--pc-accent, var(--base-accent-color))` and
  `var(--pc-hover-bg, var(--base-hover-bg, rgba(…)))`.

### Changed

- **Unified the `--pc-border-radius*` scale with the `--base-border-radius-*`
  contract the components already use.** pure-css shipped two disconnected radius
  systems: `--base-border-radius-sm/md/lg` (the unitless rem-multipliers
  `0.4/0.6/0.8` every web/svelte component reads — e.g. web-multiselect's
  `calc(var(--base-border-radius-md) * --ms-rem)`), and its OWN
  `--pc-border-radius-sm/base/lg` as hardcoded `2px/4px/8px` literals disconnected
  from the base layer. On one themed page a `<keen-web-multiselect>` and a pure-css
  `.rounded` element rounded differently, and a runtime `--base-border-radius-*`
  override re-rounded the components but not pure-css's own elements. The three
  `--pc-border-radius*` tokens now derive from the base contract —
  `calc(var(--base-border-radius-{sm,md,lg}, <default>) * 1rem)` (unsuffixed
  `--pc-border-radius` = the `-md` mid step) — mirroring how `--pc-border-color`
  already tracked `--base-border-color`. **Rendered radii change** to match the
  ecosystem: `-sm` 2px → 4px, mid 4px → 6px, `-lg` 8px (unchanged). Overriding
  `--base-border-radius-*` now re-rounds pure-css and the components together.

## [1.0.0-rc05] — 2026-08-27 [PUBLISHED]

### Added

- **The app shell moves into the foundation — navbar, sidebar, and layout
  container.** pure-css was variables + grid + utilities; rc05 also relocates the
  structural app-shell layer out of pure-admin-core, so a standalone page (docs
  site, portal) gets the same navbar/sidebar/layout chrome as a full pure-admin
  app without pulling in the component library. Seven new partials, all `@use`d
  into the `pure-css.css` **bundle only** (base.css / grid.css / utilities.css
  untouched; no new standalone artifact):
  - `_navbar.scss` + `_navbar-elements.scss` — the fixed navbar (`.pc-navbar`
    with `__inner`/`__start`/`__center`/`__end` regions) and its elements (burger
    menu, brand wordmark `.pc-app-header`, nav menu `.pc-navmenu`, page title
    `.pc-page-header`, profile button, theme switcher).
  - `_sidebar.scss` + `_sidebar-states.scss` — the sidebar nav with nested
    submenus (`.pc-sidebar`, `.pc-layout__sidebar`, drag-to-resize
    `.pc-sidebar-resize`) and its hidden / icon-collapse / expanded states.
  - `_layout-container.scss` — the layout wrapper (`.pc-layout` with
    `__inner`/`__main`/`__content`/`__footer` and the `.pc-footer__*` regions),
    including sticky/scroll content modes. Emitting `.pc-layout__main` here also
    gives the grid's container-query responsive columns (`.pc-col-md-*`) their
    documented automatic containment context in the same bundle (the
    `_pa-grid.scss` note is corrected from the pre-rc04 `.pa-layout__main` to
    `.pc-layout__main`).
  - `_layout-responsive.scss` — the mobile/tablet media queries for the shell.
  - `_resize-handle.scss` — a mixin-only partial (emits nothing on its own)
    providing the shared grab-knob look `@use`d by the sidebar resize handle and
    splitter gutters.
  - `_fit-flyout.scss` — the Fit engine's floating-menu sink
    (`.pc-fit-flyout__*`): a `•••` trigger + a `<body>`-parented panel that
    `fit.js` fills on demand when slots relocate out of the row.

  pure-admin-core keeps same-named partials that now just `@forward` these, so the
  shell is single-sourced in the foundation and the two can't drift.

- **The shell's behaviour ships too — a dependency-free JS runtime (`src/js/`).**
  The shell is no longer styling-only: the foundation now carries the vanilla-JS
  runtime that drives it, so pure-css is no longer a CSS-only package. Shipped
  **as source** (no build step) via a new `./js` export (and `./js/*` for
  individual engines); `files` gains `src/js/`.
  - `pure-css.js` installs the `window.pureCss` namespace — a tiny event bus,
    live viewport / OS-colour-scheme / capability-first device sources, overlay
    primitives (scroll-lock, keyboard-inset), an open-menu registry, a shared
    `config` baseline (single-sourced from SCSS via `--pc-*` vars), and
    `components.initAll(scope)`. Load-order-safe and stands alone when pure-admin
    is absent; `pure-admin.js` adopts the same buses by reference on top.
  - `fit.js` — the Fit engine (`data-pc-fit` = hide / steps / relocate). It
    **absorbs the former `navbar-collapse.js`** (progressive nav folding via
    `data-pc-fit-nav`, sinking items to the sidebar or a generated "More" menu),
    so that separate file no longer exists.
  - `navbar-dropdown.js` (tap-toggle nav dropdowns/submenus),
    `sidebar-resize.js` (drag-to-resize the sidebar), and
    `container-breakpoint.js` (container-query breakpoint driver).

  Shell CSS is authored no-JS-safe, so styling degrades gracefully rather than
  breaking when the runtime isn't loaded.

### Fixed

- **Migrated the dead `data-pa-nav-collapse` hook to `data-pc-fit-nav`.** The
  relocated nav-collapse CSS keyed on the pre-rc04 `pa-`-branded
  `[data-pa-nav-collapse]` attribute driven by the old `navbar-collapse.js`;
  since that engine is now merged into `fit.js` (which reads `data-pc-fit-nav`),
  the selectors in `_navbar-elements.scss` / `_layout-responsive.scss` were stale
  and matched nothing. Repointed at `[data-pc-fit-nav]` and corrected the
  companion comments (`navbar-collapse.js` → `fit.js`). Also de-branded the fit
  hide-class `.pa-fit-hidden` → `.pc-fit-hidden`.

### Internal

- **GitHub Actions release workflow (`.github/workflows/release.yml`).** On a `v*.*.*`
  tag push, builds the CSS (`npm ci` + `npm run build`) and publishes a GitHub Release
  with a `pure-css-<version>.zip` (bundling `dist/`, `src/scss/`, `README.md`,
  `CHANGELOG.md`, `LICENSE` — the same set as the package `files`, so the zip is a
  toolchain-free drop-in for consumers who don't use npm) plus a `.sha256` checksum.
  Auto-generated release notes; tags containing `-` (rc) publish as a pre-release.
  Mirrors pure-admin-core's release workflow, adapted for this single-package repo.
- **Exhaustive, data-driven utilities e2e coverage.** Rewrote `e2e/utilities.spec.ts`
  from a handful of spot-checks into a hard value assertion for 655 of the 664 shipped
  utility classes (the 9 `auto` sizing classes — `m-auto` + per-side, `w-auto`, `h-auto` —
  are layout-resolved and covered behaviourally instead). Each family measures every one
  of its classes' computed styles in a single in-browser pass, then diffs in Node so a
  failure lists exactly which classes are off; the expectations independently encode the
  10px-rem contract and the documented scales rather than reading them back from the CSS,
  so a failure means the compiled output disagrees with the contract or the contract
  regressed. Renamed the fixture `test/utilities.html` → `test/utilities-scale.html` with
  definite-size `#w-parent` / `#h-parent` containers so percentage widths/heights resolve
  to known px. Test-only — no change to shipped CSS.

## [1.0.0-rc04] — 2026-08-26 [PUBLISHED]

### Changed (BREAKING)

- **pure-css now ships only the BASE token contract — component tokens moved to
  the consumer that owns the components.** pure-css is a *foundation*: its
  bundles (`pure-css.css`, `base.css`) now emit only the ~46 base `--pc-*` tokens
  its own CSS consumes or exposes as universal theming primitives (surfaces,
  text, accent, links, border, the semantic role identities + their utility text
  colours, the theme palette slots, the radius scale). The ~165 **component**
  tokens (`--pc-btn-*`, `--pc-card-*`, `--pc-table-*`, `--pc-alert-*`, badges,
  tooltips, panels, command palette, multiselect, sentiment scale, form spacing,
  the derived contextual surfaces, admin layout chrome) are no longer emitted by
  the foundation. They are pure-admin's contract.
  - `output-pc-css-variables` is now base-only. The component tokens are emitted
    by the new **`output-pc-component-variables`** mixin (+ the existing
    `output-pc-alert-variables-{light,dark}`), which pure-css still *defines*
    (they read the shared `$`-variable vocabulary in `variables/*`, so they must
    be authored where that vocabulary is in scope) but does **not** call from its
    own bundle. Consumers that ship the components — pure-admin core, every
    theme — opt in by `@include output-pc-component-variables` alongside
    `output-pc-css-variables`.
  - **Theme authors / anyone calling the emit mixins must add
    `@include output-pc-component-variables;`** (after `output-pc-css-variables`)
    or lose every component token. Consumers of the *compiled* theme/core CSS are
    unaffected — the emitted token set is identical, just split across two mixins.
- **Every emitted CSS variable de-branded from `--pa-*` to `--pc-*`.** pure-css is
  a *foundation*, but it still emitted its entire runtime custom-property surface
  under pure-admin's `pa` brand. The full `--pa-*` set (~210 vars: `--pa-accent`,
  `--pa-text-color-*`, `--pa-card-bg`, `--pa-border-*`, the contextual /alert sets,
  `--pa-color-1..9` + `-text`, the new `--pc-*` form-spacing family already shipped
  this cut, etc.) is renamed to `--pc-*`. This completes the same de-branding the
  grid/mode classes started above — nothing pure-admin-branded remains in the
  foundation's output.
  - **The emit mixins move too:** `output-pa-css-variables` → `output-pc-css-variables`,
    `output-pa-alert-variables-light` / `-dark` → `output-pc-alert-variables-*`.
    (`output-base-css-variables` is unchanged — `--base-*` is a separate, neutral
    web-component contract and stays.)
  - **Untouched:** `--base-*` (web-component bridge), `--page-loader-*` (pre-FOUC
    loader), and the `.pa-color-{name}` colour-variant **class** (a class, not a
    `--pa-` variable).
  - **Migration:** a boundary-aware replace of the string `--pa-` → `--pc-` across
    markup, stylesheets, inline `style="--pa-…"`, JS `getPropertyValue`/`setProperty`
    calls, and every theme's `:root` / dark-mode `--pa-*` override block. Safe
    because the leading `--` + trailing `-` can't match `--base-*` or `--page-loader-*`.
    pure-admin, its demo, all 16 themes, and the svelte/keen wrappers migrate in
    lockstep with this release.
- **Grid classes renamed from the consumer-branded `pa-` to the foundation's own
  `pc-` prefix.** `.pa-row` → `.pc-row`, `.pa-col*` → `.pc-col*` (all percentage /
  fraction / responsive / `--grow`/`--shrink`/`--no-padding` variants),
  `.pa-offset*` → `.pc-offset*`, `.pa-cq` → `.pc-cq`, `.pa-hide*` → `.pc-hide*`,
  `.pa-show*` → `.pc-show*`. The grid is a pure-css *foundation* primitive, so it
  should not carry pure-admin's (`pa`) brand — this de-couples it. **No dual-emit:**
  the old `pa-*` grid classes are gone. Consumers must migrate markup
  (`class="pa-col-1-2"` → `class="pc-col-1-2"`) — a boundary-aware find/replace
  (careful: `pa-col` is a substring of `pa-color-*`, which must NOT be touched).
  pure-admin, its demo, and the svelte/keen wrappers are migrated in lockstep.
- **Light/dark mode scope classes renamed `.pa-mode-*` → `.pc-mode-*`.**
  The light/dark scopes the foundation emits its variables against (and that apps
  toggle on `<body>`) are foundation-owned, so they move to the `pc-` prefix too.
  `output-pc-css-variables` now emits at `:root, .pc-mode-light, .pc-mode-dark`.
  Consumers toggling the class in JS (`classList.add('pc-mode-dark')`) and themes'
  dark-mode blocks migrate in lockstep. (Safe replace: the string `pa-mode-` →
  `pc-mode-`; `pa-modal` is untouched since `mode` ≠ `moda`.)

### Added

- **Sizing utilities consolidated into the foundation.** The universal sizing/flex
  utilities that had been left in pure-admin now live here, so a standalone
  pure-css page has the full set: viewport heights `h-full` / `h-screen` /
  `min-h-full` / `min-h-screen` / `max-h-full` / `max-h-screen`, and the
  Tailwind-style flex shorthands `flex-1` / `flex-auto` / `flex-initial` /
  `flex-none` / `flex-grow` / `flex-shrink` (alongside the existing
  `flex-grow-0/1`, `flex-shrink-0/1`). pure-css already owned the width/height %
  + rem scales (`w-*`/`h-*`, `wr-*`/`hr-*`) and the full min/max families
  (`minw-*`/`maxh-*`/`minwr-*`/`maxhr-*`/…); pure-admin's duplicate rem-height
  `h-Nx`/`min-h-Nx`/`max-h-Nx` set (byte-identical to `hr-N`/`minhr-N`/`maxhr-N`)
  is retired in favour of the foundation's `hr-`/`wr-` naming (`r` = rem).
- **Complete form-spacing contract as runtime CSS variables, under a pure-css-owned
  `--pc-` namespace.** `output-pc-css-variables` now emits the full anatomy of a
  form's spacing at `:root`, so every consumer (pure-admin, keen-docs,
  keen-pure-admin) shares one contract instead of re-declaring `var()` chains or
  being stuck with compile-time-only margins:
  - Vertical rhythm: `--pc-label-gap` (label → control), `--pc-help-gap`
    (control → help/error), `--pc-field-gap` (field → field),
    `--pc-form-actions-offset` (last field → actions row).
  - Inline gaps: `--pc-form-gap` (shared + label↔inline-icon), `--pc-choice-gap`
    (between options), `--pc-choice-inner-gap` (control↔label), `--pc-form-actions-gap`
    (between buttons), `--pc-field-horizontal-gap` (horizontal label col↔input col).

  The inline "gap" family chains to `--pc-form-gap` (one knob moves them all);
  every var is also overridable on its own scope. These are the first
  foundation-owned runtime vars to use `--pc-` rather than the legacy
  consumer-branded `--pa-` prefix — new foundation tokens should follow suit.

### Changed

- **Renamed the misleading `$form-scale` token to `$form-gap`.** It reads like an
  input-sizing multiplier but is only ever consumed as a `gap:` value — the small
  gap between adjacent form bits (a label and its inline icon, footer action
  buttons, checkbox/radio group options). `$form-scale` is kept as a `!default`
  alias of `$form-gap`, so existing overrides keep working; it will be retired in
  a major. (pure-admin reads the gap through `var(--pc-form-gap, …)`, so it is
  also runtime-tunable.)

## [1.0.0-rc03] — 2026-08-21 [PUBLISHED]

### Changed

- **BREAKING — renamed the top-bar region tokens from `header` to `navbar`.** The
  foundation's top-region tokens named the bar as a *component block* rather than a
  layout region, which read as misleading once pure-admin's navbar component dropped its
  legacy `pa-header__*` block naming. Renamed:
  - SCSS variables: `$header-height` → `$navbar-height`, `$header-bg` → `$navbar-bg`,
    `$header-border-color` → `$navbar-border-color`, `$header-text` → `$navbar-text`,
    `$header-text-secondary` → `$navbar-text-secondary`,
    `$header-profile-name-color` → `$navbar-profile-name-color`,
    `$z-index-header` → `$z-index-navbar`.
  - CSS variables: `--pa-header-bg` → `--pa-navbar-bg`,
    `--pa-header-border-color` → `--pa-navbar-border-color`,
    `--pa-header-text` → `--pa-navbar-text`,
    `--pa-header-text-secondary` → `--pa-navbar-text-secondary`,
    `--pa-header-profile-name-color` → `--pa-navbar-profile-name-color`.
  - `$footer-height` still mirrors the bar height (now `$navbar-height`); component-header
    tokens (`$card-header-*`, `$table-header-*`) are unaffected.

### Removed

- **Dead `$header-brand-padding-left` variable.** Superseded by the navbar's flex `gap`;
  no live rule consumed it (only a stale comment referenced it).

## [1.0.0-rc02] — 2026-08-05 [PUBLISHED]

### Added

- **Reboot layer (`reboot.scss`) — the reset the foundation always assumed.** Emits
  `html { font-size: 10px }` (the 10px rem base every pure-css rem value is authored
  against — `$font-size-base: 1.6rem` is 16px *only* at a 10px root), a `box-sizing:
  border-box` reset, neutral base styling for standard elements (headings, paragraphs,
  links, lists, blockquotes, `hr`, `figure`), the `body` font/colour/background, and the
  `button/input/select/textarea/label { font: inherit }` reset. Relocated from
  pure-admin-core's `core-components/_base.scss` so it sits with the rem-scale variables
  that depend on it. Analogous to Bootstrap's Reboot.
- **New `reboot.css` build artifact** + `./reboot` export, and `reboot` is now part of the
  `pure-css.css` bundle (emitted before grid/utilities).
- **Themed scrollbars (`scrollbars.scss`).** The global `*::-webkit-scrollbar` + Firefox
  `scrollbar-width`/`scrollbar-color` styling (thin scrollbars coloured from the `--pa-*`
  cascade), relocated from pure-admin-core's `core-components/_scrollbars.scss`. Global browser
  chrome belongs with the foundation's consistent-appearance promise, so a standalone pure-css
  page gets the same themed scrollbars as a full pure-admin app instead of native ones. Part of
  the `pure-css.css` bundle, plus a standalone `scrollbars.css` artifact + `./scrollbars` export.

### Fixed

- **Standalone consumers no longer render 1.6× too large.** Before, the 10px base lived
  only in pure-admin-core, so a page linking `pure-css.css` (or `base.css`) on its own
  inherited the browser's 16px root and every rem was 1.6× oversized. The bundle now ships
  the 10px base itself, so the sizing scale is correct out of the box.

## [1.0.0-rc01] — 2026-08-04

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
- **Native flexbox grid** — `_pa-grid.scss` (`.pa-row` / `.pa-col`: percentage columns in 5%
  increments, intuitive fractions, container-query responsive variants, offsets, visibility helpers),
  relocated from pure-admin-core's `core-components/_grid.scss`. Replaces the legacy PureCSS
  `.pure-g` / `.pure-u-*` grid, which pure-admin had already stopped using — so pure-css ships the
  grid consumers actually use, not the deprecated one.
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

- **pure-admin-core consumes this package** as its single source for the foundation (thin
  `@import`/`@forward` shims for the variables, `--base-*`/`--pa-*` emit mixins, utilities, and the
  grid). The two no longer carry duplicate copies, so compiled `--base-*` values and grid output
  match core's `dist/css/main.css` exactly.
