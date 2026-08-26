import { test, expect } from './fixtures';

/**
 * Utility output is rem-based on the 10px root, so the px values below are the
 * contract: .m-4 = 1rem = 10px, .p-2 = 0.5rem = 5px. Fraction widths, display,
 * flex and semantic colour utilities are spot-checked against the real render.
 */
test.beforeEach(async ({ page }) => {
    await page.goto('/test/utilities.html');
});

test('.m-4 is 1rem = 10px of margin', async ({ page }) => {
    const margin = await page
        .locator('#margin')
        .evaluate((el) => getComputedStyle(el).marginTop);
    expect(margin).toBe('10px');
});

test('.p-2 is 0.5rem = 5px of padding', async ({ page }) => {
    const padding = await page
        .locator('#padding')
        .evaluate((el) => getComputedStyle(el).paddingTop);
    expect(padding).toBe('5px');
});

test('.w-1-2 renders 50% of its parent', async ({ page }) => {
    const parent = (await page.locator('#w-parent').boundingBox())!;
    const half = (await page.locator('#w-half').boundingBox())!;
    expect(half.width).toBeCloseTo(parent.width / 2, 0);
});

test('.d-flex / .justify-content-center apply', async ({ page }) => {
    const { display, justify } = await page.locator('#flex').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, justify: cs.justifyContent };
    });
    expect(display).toBe('flex');
    expect(justify).toBe('center');
});

test('.d-none hides and .text-center centers', async ({ page }) => {
    const display = await page
        .locator('#hidden')
        .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('none');

    const align = await page
        .locator('#centered')
        .evaluate((el) => getComputedStyle(el).textAlign);
    expect(align).toBe('center');
});

test('.text-primary paints the accent colour', async ({ page }) => {
    const color = await page
        .locator('#primary')
        .evaluate((el) => getComputedStyle(el).color);
    // --pc-accent default #007bff
    expect(color).toBe('rgb(0, 123, 255)');
});
