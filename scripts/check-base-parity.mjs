#!/usr/bin/env node
// ============================================================================
// check-base-parity.mjs — drift guard for the --base-* token contract
// ============================================================================
// @keenmate/base-css-variables is the CANONICAL --base-* contract (the parent).
// pure-css only MIRRORS that token list into SCSS ($base-*) and re-emits it.
// This guard fails if the two have drifted — i.e. pure-css emits a --base-* the
// parent lacks, or the parent defines one pure-css never emits.
//
// Going-forward rule: author a NEW --base-* token in base-css-variables FIRST,
// then mirror it into pure-css (variables/_base.scss + the emit mixin). This
// guard is how we keep that honest.
//
// Usage:
//   npm run build                      # regenerate dist/css/base.css first
//   node scripts/check-base-parity.mjs [path/to/base-variables.css]
// Resolution order for the parent file: arg → $BASE_CSS_VARS → sibling repo
// (../base-css-variables) → node_modules. If none is found the check is SKIPPED
// (exit 0) so it never breaks a build where the sibling contract isn't present.
// ============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PURE_CSS = resolve(root, 'dist/css/base.css');

const parentCandidates = [
  process.argv[2],
  process.env.BASE_CSS_VARS,
  resolve(root, '../base-css-variables/base-variables.css'),
  resolve(root, 'node_modules/@keenmate/base-css-variables/base-variables.css'),
].filter(Boolean);
const PARENT = parentCandidates.find(existsSync);

// pure-css emits these, the canonical contract intentionally omits them (dead —
// consumed by nobody; candidates to drop from pure-css rather than propagate).
const ALLOWED_PURECSS_ONLY = new Set([
  '--base-hover-overlay',
  '--base-active-overlay',
  '--base-focus-ring-color',
  '--base-focus-ring-width',
]);

// Declaration names only: a --base-* immediately followed by `:` (skips the var()
// references inside fallback chains, which are followed by `,` or `)`).
const tokenNames = (file) => {
  const set = new Set();
  for (const m of readFileSync(file, 'utf8').matchAll(/--base-[a-z0-9-]+(?=\s*:)/g)) set.add(m[0]);
  return set;
};

if (!existsSync(PURE_CSS)) {
  console.error(`✗ ${PURE_CSS} not found — run \`npm run build\` first.`);
  process.exit(2);
}
if (!PARENT) {
  console.warn('⚠ base-css-variables not found (sibling repo / node_modules / arg).');
  console.warn('  Skipping parity check. Pass a path: node scripts/check-base-parity.mjs <base-variables.css>');
  process.exit(0);
}

const pc = tokenNames(PURE_CSS);
const parent = tokenNames(PARENT);

const pcOnly = [...pc].filter((n) => !parent.has(n) && !ALLOWED_PURECSS_ONLY.has(n)).sort();
const parentOnly = [...parent].filter((n) => !pc.has(n)).sort();

let drift = false;
if (pcOnly.length) {
  drift = true;
  console.error('✗ DRIFT — pure-css emits --base-* tokens the canonical contract LACKS:');
  console.error('  → add them to base-css-variables/base-variables.css (or mark dead in this script)');
  pcOnly.forEach((n) => console.error(`      + ${n}`));
}
if (parentOnly.length) {
  drift = true;
  console.error('✗ DRIFT — the canonical contract has --base-* tokens pure-css does NOT emit:');
  console.error('  → mirror them into pure-css variables/_base.scss + the emit mixin');
  parentOnly.forEach((n) => console.error(`      - ${n}`));
}

if (drift) {
  console.error(`\npure-css: ${pc.size} · parent: ${parent.size} · allowed-dead: ${ALLOWED_PURECSS_ONLY.size}`);
  console.error('Rule: new --base-* tokens are authored in base-css-variables FIRST, then mirrored into pure-css.');
  process.exit(1);
}

console.log(
  `✓ --base-* parity OK — ${pc.size} pure-css tokens match the canonical contract ` +
    `(+${ALLOWED_PURECSS_ONLY.size} allowed-dead).`,
);
console.log(`  parent: ${PARENT}`);
