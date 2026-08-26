import { test, expect } from './fixtures';

/**
 * The .pc-row / .pc-col-* flexbox grid, including the container-query responsive
 * variants that replaced the legacy Pure .pure-g grid. We assert the fraction
 * math renders and that a .pc-col-md-* flips across the 768px container
 * threshold when its .pc-cq container is resized.
 */
test.beforeEach(async ({ page }) => {
    await page.goto('/test/grid.html');
});

test('.pc-row is a wrapping flex row', async ({ page }) => {
    const { display, wrap } = await page
        .locator('.pc-row')
        .first()
        .evaluate((el) => {
            const cs = getComputedStyle(el);
            return { display: cs.display, wrap: cs.flexWrap };
        });
    expect(display).toBe('flex');
    expect(wrap).toBe('wrap');
});

test('.pc-col-1-2 is ~1.5x the width of .pc-col-1-3', async ({ page }) => {
    const half = (await page.locator('#col-half').boundingBox())!;
    const third = (await page.locator('#col-third').boundingBox())!;
    // 50% / 33.3% = 1.5 (gutters cancel — both cols sit in identical rows)
    expect(half.width / third.width).toBeGreaterThan(1.4);
    expect(half.width / third.width).toBeLessThan(1.6);
});

test('container query flips .pc-col-md-1-2 across the 768px threshold', async ({ page }) => {
    const colWidth = async () => (await page.locator('#col-resp').boundingBox())!.width;
    const setCq = (w: number) =>
        page.locator('#cq').evaluate((el, width) => {
            (el as HTMLElement).style.width = `${width}px`;
        }, w);

    // Narrow container (< 768px): column spans the full row.
    await setCq(400);
    expect(await colWidth()).toBeGreaterThan(400 * 0.8);

    // Wide container (>= 768px): .pc-col-md-1-2 kicks in -> ~half.
    await setCq(900);
    const wide = await colWidth();
    expect(wide).toBeLessThan(900 * 0.6);
    expect(wide).toBeGreaterThan(900 * 0.4);
});
