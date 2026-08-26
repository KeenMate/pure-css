import { test, expect } from './fixtures';

/**
 * Smoke test for the showcase site. Every demo page must load, render its
 * heading and shared nav, and — via the auto pageErrors guard in fixtures.ts —
 * throw no uncaught JS errors (bad asset path, broken demo.js, etc.).
 */
const PAGES = [
    'index',
    'theming',
    'grid',
    'utilities',
    'typography',
    'colors',
    'scrollbars'
];

for (const name of PAGES) {
    test(`demo/${name}.html loads cleanly`, async ({ page }) => {
        await page.goto(`/demo/${name}.html`);
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('[data-demo-nav]')).toBeVisible();
    });
}

test('theming playground re-themes the accent live', async ({ page }) => {
    await page.goto('/demo/theming.html');

    const swatchColor = () =>
        page.locator('[data-theme-target]').first().evaluate((el) => getComputedStyle(el).color);

    const before = await swatchColor();
    // Drive the accent control to a known colour and apply.
    await page.locator('#accent-input').evaluate((el: HTMLInputElement) => {
        el.value = '#ff0000';
        el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const after = await swatchColor();

    expect(after).toBe('rgb(255, 0, 0)');
    expect(after).not.toBe(before);
});
