import { test, expect } from './fixtures';

/**
 * scrollbars.css opts every overflow container into the thin, theme-coloured
 * scrollbar. Webkit pseudo-elements (::-webkit-scrollbar) aren't reachable via
 * getComputedStyle, so we assert the standard `scrollbar-width: thin` property
 * (Chromium supports it) and that the panel is genuinely scrollable.
 */
test.beforeEach(async ({ page }) => {
    await page.goto('/test/scrollbars.html');
});

test('overflow containers get scrollbar-width: thin', async ({ page }) => {
    const width = await page
        .locator('#panel')
        .evaluate((el) => getComputedStyle(el).getPropertyValue('scrollbar-width'));
    expect(width.trim()).toBe('thin');
});

test('the panel overflows on both axes', async ({ page }) => {
    const scrollable = await page.locator('#panel').evaluate((el) => ({
        x: el.scrollWidth > el.clientWidth,
        y: el.scrollHeight > el.clientHeight
    }));
    expect(scrollable.x).toBe(true);
    expect(scrollable.y).toBe(true);
});
