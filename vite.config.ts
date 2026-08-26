import { defineConfig } from 'vite';

/**
 * Vite dev server for pure-css.
 *
 * pure-css ships no JS and no bundle — Vite is used purely as a static dev
 * server so the Playwright e2e suite (e2e/) and the showcase site (demo/) can be
 * served over http. Both link the *committed* build output at /dist/css/*.css,
 * so the tests exercise the real published artifacts rather than a recompile.
 *
 *   npm run dev   # serve on :12500 — open /demo/index.html or /test/*.html
 *
 * Nothing here is part of the published package (see the `files` whitelist in
 * package.json); demo/, test/ and e2e/ are dev-only.
 */
export default defineConfig({
    root: '.',
    server: {
        port: 12500,
        strictPort: true
    }
});
