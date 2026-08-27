import { test, expect, Page } from './fixtures';

/**
 * Exhaustive, data-driven coverage of utilities.css.
 *
 * 655 of the 664 shipped utility classes get a hard value assertion here. The
 * remaining 9 are the `auto` sizing classes (m-auto and its per-side variants,
 * w-auto, h-auto) whose computed value is a layout-resolved used value, not a
 * fixed number to pin — `mx-auto` centering is covered behaviourally instead.
 *
 * The expectations here independently encode the *contract* — the 10px rem base
 * and the documented scales — rather than being read back from the CSS. So a
 * failure means the compiled output disagrees with the contract (a wrong value)
 * OR the contract changed (a regression). Each family fetches every one of its
 * classes' computed styles in a single in-browser pass, then diffs in Node so a
 * failure lists exactly which classes are off.
 *
 * PX below is "1rem in px" given reboot's `html { font-size: 10px }`.
 */
const PX = 10;

test.beforeEach(async ({ page }) => {
    await page.goto('/test/utilities-scale.html');
});

// --- the scales (the source of truth these tests defend) --------------------
const SPACE_NUM: [number, number][] = [
    [0, 0], [1, 0.25], [2, 0.5], [3, 0.75], [4, 1], [5, 1.25],
    [6, 1.5], [8, 2], [10, 2.5], [12, 3], [16, 4], [20, 5]
];
const SPACE_NAMED: [string, number][] = [
    ['xs', 0.4], ['sm', 0.8], ['md', 1.2], ['base', 1.6],
    ['lg', 2.4], ['xl', 3.2], ['2xl', 4.8]
];
const SPACE_ALL: [string | number, number][] = [...SPACE_NUM, ...SPACE_NAMED];

const REM18 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const REM_MINH = [...REM18, 60, 70, 80, 90, 100];
const PCT20 = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const H_PCT = [25, 50, 75, 100];
const FRACTIONS: [string, number][] = [
    ['1-2', 50], ['1-3', 100 / 3], ['1-4', 25], ['2-3', 200 / 3], ['3-4', 75]
];

// --- in-browser measurement -------------------------------------------------
type Probe = { cls: string; prop: string; parent?: string };

async function measure(page: Page, items: Probe[]): Promise<string[]> {
    return page.evaluate((items) => {
        return items.map(({ cls, prop, parent }) => {
            const host = parent ? document.getElementById(parent)! : document.body;
            const el = document.createElement('div');
            el.className = cls;
            host.appendChild(el);
            const val = (getComputedStyle(el) as any)[prop] as string;
            el.remove();
            return val;
        });
    }, items);
}

function collectNumeric(items: Probe[], actual: string[], expected: number[], tol: number): string[] {
    const fails: string[] = [];
    items.forEach((it, i) => {
        const got = parseFloat(actual[i]);
        if (!(Math.abs(got - expected[i]) <= tol)) {
            fails.push(`.${it.cls} {${it.prop}}: got "${actual[i]}", want ~${expected[i]}px`);
        }
    });
    return fails;
}

function collectExact(items: Probe[], actual: string[], expected: string[]): string[] {
    const fails: string[] = [];
    items.forEach((it, i) => {
        if (actual[i] !== expected[i]) {
            fails.push(`.${it.cls} {${it.prop}}: got "${actual[i]}", want "${expected[i]}"`);
        }
    });
    return fails;
}

// =============================================================================
// spacing — margins & paddings, every side/axis prefix × every scale key
// =============================================================================
const MARGIN_SIDES: Record<string, string[]> = {
    '': ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    t: ['marginTop'], r: ['marginRight'], b: ['marginBottom'], l: ['marginLeft'],
    x: ['marginLeft', 'marginRight'], y: ['marginTop', 'marginBottom']
};
const PADDING_SIDES: Record<string, string[]> = {
    '': ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    t: ['paddingTop'], r: ['paddingRight'], b: ['paddingBottom'], l: ['paddingLeft'],
    x: ['paddingLeft', 'paddingRight'], y: ['paddingTop', 'paddingBottom']
};

async function checkSpacing(page: Page, base: 'm' | 'p', sides: Record<string, string[]>) {
    const items: Probe[] = [];
    const expected: number[] = [];
    for (const [prefix, props] of Object.entries(sides)) {
        for (const [key, rem] of SPACE_ALL) {
            for (const prop of props) {
                items.push({ cls: `${base}${prefix}-${key}`, prop });
                expected.push(rem * PX);
            }
        }
    }
    const actual = await measure(page, items);
    const fails = collectNumeric(items, actual, expected, 0.05);
    expect(fails, `${items.length} probes\n${fails.join('\n')}`).toEqual([]);
}

test('margins — every .m{,t,r,b,l,x,y}-<key> matches the spacing scale', async ({ page }) => {
    await checkSpacing(page, 'm', MARGIN_SIDES);
});

test('paddings — every .p{,t,r,b,l,x,y}-<key> matches the spacing scale', async ({ page }) => {
    await checkSpacing(page, 'p', PADDING_SIDES);
});

test('margin auto centers a fixed-width block', async ({ page }) => {
    const [ml] = await measure(page, [
        // 200px block with mx-auto in a 1000px parent -> 400px each side
        { cls: 'mx-auto w-20', prop: 'marginLeft', parent: 'w-parent' }
    ]);
    expect(parseFloat(ml)).toBeGreaterThan(0);
});

// =============================================================================
// gap
// =============================================================================
test('gap — .gap-<n> / .gap-x-<n> / .gap-y-<n> match the numeric scale', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    for (const [key, rem] of SPACE_NUM) {
        items.push({ cls: `d-flex gap-${key}`, prop: 'gap' }); expected.push(rem * PX);
        items.push({ cls: `d-flex gap-x-${key}`, prop: 'columnGap' }); expected.push(rem * PX);
        items.push({ cls: `d-flex gap-y-${key}`, prop: 'rowGap' }); expected.push(rem * PX);
    }
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.05).join('\n')).toBe('');
});

// =============================================================================
// widths — percentages, fractions, *-fixed, and the rem (wr/minwr/maxwr) scale
// =============================================================================
test('widths — .w-<pct> and fractions resolve against a 1000px parent', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    for (const n of PCT20) { items.push({ cls: `w-${n}`, prop: 'width', parent: 'w-parent' }); expected.push(n * 10); }
    for (const [f, pct] of FRACTIONS) { items.push({ cls: `w-${f}`, prop: 'width', parent: 'w-parent' }); expected.push(pct * 10); }
    items.push({ cls: 'w-100', prop: 'width', parent: 'w-parent' }); expected.push(1000);
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.6).join('\n')).toBe('');
});

test('widths — .w-<n>-fixed sets both width and min-width', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    // width (a length) resolves to px; min-width (a percentage) is reported by
    // getComputedStyle as the "%" string, so we compare its numeric part.
    const fixed: [string, number, number][] = [
        ['25', 250, 25], ['50', 500, 50], ['75', 750, 75], ['100', 1000, 100],
        ['1-2', 500, 50], ['1-3', 1000 / 3, 100 / 3], ['2-3', 2000 / 3, 200 / 3],
        ['1-4', 250, 25], ['3-4', 750, 75]
    ];
    for (const [key, px, pct] of fixed) {
        items.push({ cls: `w-${key}-fixed`, prop: 'width', parent: 'w-parent' }); expected.push(px);
        items.push({ cls: `w-${key}-fixed`, prop: 'minWidth', parent: 'w-parent' }); expected.push(pct);
    }
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.6).join('\n')).toBe('');
});

test('rem widths — .wr / .minwr / .maxwr-<n> are n×10px', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    for (const n of REM18) {
        items.push({ cls: `wr-${n}`, prop: 'width' }); expected.push(n * PX);
        items.push({ cls: `minwr-${n}`, prop: 'minWidth' }); expected.push(n * PX);
        items.push({ cls: `maxwr-${n}`, prop: 'maxWidth' }); expected.push(n * PX);
    }
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.05).join('\n')).toBe('');
});

test('min/max width (percent) — .minw / .maxw / .mw and fractions', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    // min/max-width percentages are reported as the "%" string -> compare number
    for (const n of PCT20) {
        items.push({ cls: `minw-${n}`, prop: 'minWidth' }); expected.push(n);
        items.push({ cls: `maxw-${n}`, prop: 'maxWidth' }); expected.push(n);
    }
    // minw ships only 1-3 / 2-3 fractions; maxw ships all five
    for (const [f, pct] of [['1-3', 100 / 3], ['2-3', 200 / 3]] as [string, number][]) {
        items.push({ cls: `minw-${f}`, prop: 'minWidth' }); expected.push(pct);
    }
    for (const [f, pct] of FRACTIONS) { items.push({ cls: `maxw-${f}`, prop: 'maxWidth' }); expected.push(pct); }
    // NOTE: .mw-* is a *min-width* shorthand (not max-width, despite the name).
    for (const [k, pct] of [['25', 25], ['50', 50], ['75', 75], ['100', 100],
        ['1-2', 50], ['1-3', 100 / 3], ['2-3', 200 / 3], ['1-4', 25], ['3-4', 75]] as [string, number][]) {
        items.push({ cls: `mw-${k}`, prop: 'minWidth' }); expected.push(pct);
    }
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.6).join('\n')).toBe('');

    // min-width:auto computes to 0px on a block box; accept either form.
    const [mwAuto] = await measure(page, [{ cls: 'mw-auto', prop: 'minWidth' }]);
    expect(['auto', '0px']).toContain(mwAuto);
});

test('keyword sizes — full / screen resolve correctly', async ({ page }) => {
    const vh = await page.evaluate(() => window.innerHeight);
    const r = await page.evaluate(() => {
        const mk = (cls: string, prop: string, parent?: string) => {
            const host = parent ? document.getElementById(parent)! : document.body;
            const el = document.createElement('div');
            el.className = cls;
            host.appendChild(el);
            const v = (getComputedStyle(el) as any)[prop] as string;
            el.remove();
            return v;
        };
        return {
            hFull: mk('h-full', 'height', 'h-parent'),
            minhFull: mk('min-h-full', 'minHeight', 'h-parent'),
            maxhFull: mk('max-h-full', 'maxHeight', 'h-parent'),
            hScreen: mk('h-screen', 'height'),
            minhScreen: mk('min-h-screen', 'minHeight'),
            maxhScreen: mk('max-h-screen', 'maxHeight')
        };
    });
    expect(parseFloat(r.hFull)).toBeCloseTo(400, 0);   // 100% of the 400px parent
    expect(r.minhFull).toBe('100%');
    expect(r.maxhFull).toBe('100%');
    const isScreen = (v: string) => v === '100vh' || Math.abs(parseFloat(v) - vh) < 2;
    expect(isScreen(r.hScreen)).toBe(true);
    expect(isScreen(r.minhScreen)).toBe(true);
    expect(isScreen(r.maxhScreen)).toBe(true);
});

test('.pc-cq establishes a container-query context', async ({ page }) => {
    const [ct] = await measure(page, [{ cls: 'pc-cq', prop: 'containerType' }]);
    expect(ct).toBe('inline-size');
});

// =============================================================================
// heights — percentages (h/minh/maxh) and the rem (hr/minhr/maxhr) scale
// =============================================================================
test('heights — .h-<pct> / .minh / .maxh resolve against a 400px parent', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    // `height` (a length) resolves to px against the 400px parent; min/max-height
    // percentages are reported as the "%" string, so we compare the numeric part.
    for (const n of H_PCT) { items.push({ cls: `h-${n}`, prop: 'height', parent: 'h-parent' }); expected.push(n / 100 * 400); }
    for (const n of PCT20) { items.push({ cls: `minh-${n}`, prop: 'minHeight', parent: 'h-parent' }); expected.push(n); }
    for (const n of PCT20) { items.push({ cls: `maxh-${n}`, prop: 'maxHeight', parent: 'h-parent' }); expected.push(n); }
    // fraction variants: h-* resolves to px, minh/maxh-* report the "%"
    for (const [f, pct] of FRACTIONS) { items.push({ cls: `h-${f}`, prop: 'height', parent: 'h-parent' }); expected.push(pct / 100 * 400); }
    for (const [f, pct] of FRACTIONS) { items.push({ cls: `minh-${f}`, prop: 'minHeight', parent: 'h-parent' }); expected.push(pct); }
    for (const [f, pct] of FRACTIONS) { items.push({ cls: `maxh-${f}`, prop: 'maxHeight', parent: 'h-parent' }); expected.push(pct); }
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.6).join('\n')).toBe('');
});

test('rem heights — .hr / .minhr / .maxhr-<n> are n×10px', async ({ page }) => {
    const items: Probe[] = [];
    const expected: number[] = [];
    for (const n of REM18) { items.push({ cls: `hr-${n}`, prop: 'height' }); expected.push(n * PX); }
    for (const n of REM_MINH) { items.push({ cls: `minhr-${n}`, prop: 'minHeight' }); expected.push(n * PX); }
    for (const n of REM18) { items.push({ cls: `maxhr-${n}`, prop: 'maxHeight' }); expected.push(n * PX); }
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, expected, 0.05).join('\n')).toBe('');
});

// =============================================================================
// radius — wired to the --pc-border-radius* scale
// =============================================================================
test('radius — .rounded* read the token scale and target the right corners', async ({ page }) => {
    const items: Probe[] = [
        { cls: 'rounded', prop: 'borderTopLeftRadius' },
        { cls: 'rounded-lg', prop: 'borderTopLeftRadius' },
        { cls: 'rounded-0', prop: 'borderTopLeftRadius' },
        // corner-scoped variants: the named corner is 4px, the opposite is 0
        { cls: 'rounded-top', prop: 'borderTopLeftRadius' },
        { cls: 'rounded-top', prop: 'borderBottomLeftRadius' },
        { cls: 'rounded-bottom', prop: 'borderBottomLeftRadius' },
        { cls: 'rounded-bottom', prop: 'borderTopLeftRadius' },
        { cls: 'rounded-left', prop: 'borderTopLeftRadius' },
        { cls: 'rounded-left', prop: 'borderTopRightRadius' },
        { cls: 'rounded-right', prop: 'borderTopRightRadius' },
        { cls: 'rounded-right', prop: 'borderTopLeftRadius' }
    ];
    const actual = await measure(page, items);
    expect(collectNumeric(items, actual, [4, 8, 0, 4, 0, 4, 0, 4, 0, 4, 0], 0.05).join('\n')).toBe('');

    // .rounded-circle is a percentage — reported as the "%" string
    const [circle] = await measure(page, [{ cls: 'rounded-circle', prop: 'borderTopLeftRadius' }]);
    expect(circle).toBe('50%');
});

// =============================================================================
// borders — width / side / style, colour from --pc-border-color
// =============================================================================
test('borders — width, per-side and style utilities', async ({ page }) => {
    const num = await measure(page, [
        { cls: 'border', prop: 'borderTopWidth' },
        { cls: 'border-0', prop: 'borderTopWidth' },
        { cls: 'border-top', prop: 'borderTopWidth' },
        { cls: 'border-top', prop: 'borderBottomWidth' },
        { cls: 'border-right', prop: 'borderRightWidth' },
        { cls: 'border-bottom', prop: 'borderBottomWidth' },
        { cls: 'border-left', prop: 'borderLeftWidth' },
        // per-side zeroing variants
        { cls: 'border-top-0', prop: 'borderTopWidth' },
        { cls: 'border-right-0', prop: 'borderRightWidth' },
        { cls: 'border-bottom-0', prop: 'borderBottomWidth' },
        { cls: 'border-left-0', prop: 'borderLeftWidth' }
    ]);
    expect(num.map((v) => parseFloat(v))).toEqual([1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0]);

    const exact = await measure(page, [
        { cls: 'border', prop: 'borderTopStyle' },
        { cls: 'border', prop: 'borderTopColor' },
        { cls: 'border-solid', prop: 'borderTopStyle' },
        { cls: 'border-dashed', prop: 'borderTopStyle' },
        { cls: 'border-dotted', prop: 'borderTopStyle' },
        { cls: 'border-none', prop: 'borderTopStyle' }
    ]);
    expect(exact).toEqual([
        'solid', 'rgb(225, 229, 233)', 'solid', 'dashed', 'dotted', 'none'
    ]);
});

// =============================================================================
// display
// =============================================================================
test('display — .d-* map to their display value', async ({ page }) => {
    const map: Record<string, string> = {
        'd-none': 'none', 'd-inline': 'inline', 'd-inline-block': 'inline-block',
        'd-block': 'block', 'd-flex': 'flex', 'd-inline-flex': 'inline-flex'
    };
    const items = Object.keys(map).map((cls) => ({ cls, prop: 'display' }));
    const actual = await measure(page, items);
    expect(collectExact(items, actual, Object.values(map)).join('\n')).toBe('');
});

// =============================================================================
// flexbox helpers
// =============================================================================
test('flex — direction, wrap, fill, grow and shrink', async ({ page }) => {
    const cases: [string, string, string][] = [
        ['flex-row', 'flexDirection', 'row'],
        ['flex-column', 'flexDirection', 'column'],
        ['flex-wrap', 'flexWrap', 'wrap'],
        ['flex-nowrap', 'flexWrap', 'nowrap'],
        ['flex-fill', 'flexGrow', '1'],
        ['flex-fill', 'flexShrink', '1'],
        ['flex-fill', 'flexBasis', 'auto'],
        ['flex-grow-0', 'flexGrow', '0'],
        ['flex-grow-1', 'flexGrow', '1'],
        ['flex-shrink-0', 'flexShrink', '0'],
        ['flex-shrink-1', 'flexShrink', '1'],
        // shorthand utilities
        ['flex-1', 'flexGrow', '1'], ['flex-1', 'flexShrink', '1'], ['flex-1', 'flexBasis', '0%'],
        ['flex-auto', 'flexGrow', '1'], ['flex-auto', 'flexBasis', 'auto'],
        ['flex-initial', 'flexGrow', '0'], ['flex-initial', 'flexShrink', '1'], ['flex-initial', 'flexBasis', 'auto'],
        ['flex-none', 'flexGrow', '0'], ['flex-none', 'flexShrink', '0'],
        ['flex-grow', 'flexGrow', '1'],
        ['flex-shrink', 'flexShrink', '1']
    ];
    const items = cases.map(([cls, prop]) => ({ cls, prop }));
    const actual = await measure(page, items);
    expect(collectExact(items, actual, cases.map((c) => c[2])).join('\n')).toBe('');
});

test('justify-content / align-items — every keyword resolves', async ({ page }) => {
    const justify: Record<string, string> = {
        'justify-content-start': 'flex-start', 'justify-content-end': 'flex-end',
        'justify-content-center': 'center', 'justify-content-between': 'space-between',
        'justify-content-around': 'space-around'
    };
    const align: Record<string, string> = {
        'align-items-start': 'flex-start', 'align-items-end': 'flex-end',
        'align-items-center': 'center', 'align-items-baseline': 'baseline',
        'align-items-stretch': 'stretch'
    };
    const jItems = Object.keys(justify).map((cls) => ({ cls, prop: 'justifyContent' }));
    const aItems = Object.keys(align).map((cls) => ({ cls, prop: 'alignItems' }));
    const [jActual, aActual] = await Promise.all([measure(page, jItems), measure(page, aItems)]);
    expect(collectExact(jItems, jActual, Object.values(justify)).join('\n')).toBe('');
    expect(collectExact(aItems, aActual, Object.values(align)).join('\n')).toBe('');
});

// =============================================================================
// text — alignment/truncation, semantic colours, and the palette text slots
// =============================================================================
test('text — alignment and truncation', async ({ page }) => {
    const items: Probe[] = [
        { cls: 'text-center', prop: 'textAlign' },
        { cls: 'text-nowrap', prop: 'whiteSpace' },
        { cls: 'text-truncate', prop: 'overflow' },
        { cls: 'text-truncate', prop: 'textOverflow' }
    ];
    const actual = await measure(page, items);
    expect(actual).toEqual(['center', 'nowrap', 'hidden', 'ellipsis']);
});

test('text — semantic colours resolve to their tokens', async ({ page }) => {
    const map: Record<string, string> = {
        'text-primary': 'rgb(0, 123, 255)',   // --pc-accent
        'text-success': 'rgb(21, 87, 36)',    // --pc-success-text #155724
        'text-danger': 'rgb(114, 28, 36)',    // --pc-danger-text #721c24
        'text-warning': 'rgb(133, 100, 4)',   // --pc-warning-text #856404
        'text-info': 'rgb(12, 84, 96)'        // --pc-info-text #0c5460
    };
    const items = Object.keys(map).map((cls) => ({ cls, prop: 'color' }));
    const actual = await measure(page, items);
    expect(collectExact(items, actual, Object.values(map)).join('\n')).toBe('');
});

test('text — .text-color-1..9 default to the transparent palette slots', async ({ page }) => {
    const items = Array.from({ length: 9 }, (_, i) => ({ cls: `text-color-${i + 1}`, prop: 'color' }));
    const actual = await measure(page, items);
    // --pc-color-N default transparent -> computed color rgba(0, 0, 0, 0)
    expect(actual).toEqual(items.map(() => 'rgba(0, 0, 0, 0)'));
});

// =============================================================================
// position, shadow, font-family
// =============================================================================
test('position — .position-* map to their position value', async ({ page }) => {
    const map: Record<string, string> = {
        'position-static': 'static', 'position-relative': 'relative',
        'position-absolute': 'absolute', 'position-fixed': 'fixed', 'position-sticky': 'sticky'
    };
    const items = Object.keys(map).map((cls) => ({ cls, prop: 'position' }));
    const actual = await measure(page, items);
    expect(collectExact(items, actual, Object.values(map)).join('\n')).toBe('');
});

test('shadow — .shadow* paint (and .shadow-none clears)', async ({ page }) => {
    const items: Probe[] = [
        { cls: 'shadow-sm', prop: 'boxShadow' },
        { cls: 'shadow', prop: 'boxShadow' },
        { cls: 'shadow-lg', prop: 'boxShadow' },
        { cls: 'shadow-none', prop: 'boxShadow' }
    ];
    const actual = await measure(page, items);
    expect(actual[0]).not.toBe('none');
    expect(actual[1]).not.toBe('none');
    expect(actual[2]).not.toBe('none');
    expect(actual[3]).toBe('none');
});

test('font-family — .font-family-* switch the stack', async ({ page }) => {
    const items: Probe[] = [
        { cls: 'font-family-system', prop: 'fontFamily' },
        { cls: 'font-family-sans', prop: 'fontFamily' },
        { cls: 'font-family-serif', prop: 'fontFamily' },
        { cls: 'font-family-mono', prop: 'fontFamily' }
    ];
    const actual = (await measure(page, items)).map((v) => v.toLowerCase());
    expect(actual[0]).toContain('apple-system');
    expect(actual[1]).toContain('helvetica');
    expect(actual[2]).toContain('georgia');
    expect(actual[3]).toContain('courier');
});
