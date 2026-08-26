import { test, expect } from './fixtures';

/**
 * The theming contract. pure-css's runtime layer is the --pc-* tokens; the
 * --base-* layer is the authoring source of truth plus one runtime bridge
 * (--pc-border-color: var(--base-border-color, ...)) that KeenMate components
 * also read. These specs pin both the defaults and the two live cascades so a
 * variable rename or a broken link can't slip through.
 */
test.beforeEach(async ({ page }) => {
    await page.goto('/test/theming.html');
});

test('base.css emits the default accent tokens at :root', async ({ page }) => {
    const { pc, base } = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return {
            pc: cs.getPropertyValue('--pc-accent').trim(),
            base: cs.getPropertyValue('--base-accent-color').trim()
        };
    });
    expect(pc).toBe('#007bff');
    expect(base).toBe('#007bff');

    // ...and it renders: default .text-primary is the accent colour.
    const color = await page
        .locator('#default-primary')
        .evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(0, 123, 255)');
});

test('overriding --pc-accent re-themes .text-primary live', async ({ page }) => {
    const color = await page
        .locator('#accent-text')
        .evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 0, 0)');
});

test('--base-border-color flows through --pc-border-color to a rendered border', async ({ page }) => {
    const borderColor = await page
        .locator('#border-el')
        .evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(borderColor).toBe('rgb(0, 128, 0)');
});
