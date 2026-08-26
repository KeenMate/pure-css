import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the pure-css e2e suite.
 *
 * Specs live in e2e/ and target minimal fixture pages under test/*.html plus the
 * showcase pages under demo/*.html — all served by the Vite dev server on :12500
 * and all linking the committed dist/css/*.css (:12500). The suite locks the documented
 * foundation contracts (10px rem base, spacing scale, grid math, the
 * --base-* -> --pc-* theming cascade) against regressions.
 *
 * Commands:
 *   npm run test:e2e:install   # one-time: download chromium
 *   npm run test:e2e           # headless run
 *   npm run test:e2e:ui        # Playwright Test UI (debugging)
 *   npm run test:e2e:headed    # watch the browser
 *
 * pure-css is CSS-only with no touch behaviour — the responsive grid is
 * container-query driven and is exercised by resizing a container element, so a
 * single desktop chromium project is all that's needed (no device emulation).
 */
export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    expect: { timeout: 5_000 },

    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    reporter: process.env.CI ? 'github' : 'list',

    use: {
        baseURL: 'http://localhost:12500',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 1024 }
            }
        }
    ],

    webServer: {
        command: 'npm run dev',
        // Readiness is polled until this URL returns < 400. Root serves no index
        // (404), so point the check at a real page.
        url: 'http://localhost:12500/demo/index.html',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        stdout: 'ignore',
        stderr: 'pipe'
    }
});
