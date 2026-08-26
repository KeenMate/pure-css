import { test, expect } from './fixtures';

/**
 * reboot.css establishes the 10px rem base that the entire spacing scale and
 * every rem-valued token depends on (see CLAUDE.md "10px rem base" contract).
 * If this regresses, every downstream size silently doubles/halves.
 */
test.beforeEach(async ({ page }) => {
    await page.goto('/test/reboot.html');
});

test('html font-size is exactly 10px (the rem base)', async ({ page }) => {
    const fontSize = await page.evaluate(
        () => getComputedStyle(document.documentElement).fontSize
    );
    expect(fontSize).toBe('10px');
});

test('box-sizing is border-box on elements', async ({ page }) => {
    const boxSizing = await page
        .locator('#para')
        .evaluate((el) => getComputedStyle(el).boxSizing);
    expect(boxSizing).toBe('border-box');
});

test('body renders at 1.6rem = 16px with 1.5 line-height', async ({ page }) => {
    const { fontSize, lineHeight } = await page.evaluate(() => {
        const cs = getComputedStyle(document.body);
        return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    expect(fontSize).toBe('16px');
    // line-height: 1.5 resolves to 1.5 * 16px = 24px
    expect(lineHeight).toBe('24px');
});
