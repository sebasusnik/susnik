import { expect, test } from '@playwright/test';
import { contrast, terminalReady } from './helpers';

/** Tabs through a page and returns the outline of every distinct stop. */
async function rings(page: import('@playwright/test').Page, tabs = 20) {
  const seen = new Map<string, { color: string; style: string; bg: string }>();
  for (let i = 0; i < tabs; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null;
      if (!a || a === document.body || a.hasAttribute('data-terminal-input')) return null;
      const c = getComputedStyle(a);
      return {
        key: a.tagName + (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 20),
        color: c.outlineColor,
        style: c.outlineStyle,
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });
    if (s) seen.set(s.key, s);
  }
  return [...seen.values()];
}

for (const [name, path, color] of [
  ['home', '/', 'rgb(255, 45, 45)'],
  ['an entry page', '/projects/pixfit/', 'rgb(255, 45, 45)'],
] as const) {
  test(`${name}: every focusable wears the custom ring, at 3:1 or better`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(600);
    const stops = await rings(page);
    expect(stops.length).toBeGreaterThan(3);
    for (const s of stops) {
      expect(s.style).toBe('solid');
      expect(s.color).toBe(color);
      expect(contrast(s.color, s.bg)).toBeGreaterThanOrEqual(3);
    }
  });
}

test('under 666 the ring turns to the deep red, still above 3:1', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);
  await page.keyboard.type('666');
  await page.waitForTimeout(900);
  const [s] = await rings(page, 1);
  expect(s.color).toBe('rgb(139, 0, 0)');
  expect(contrast(s.color, s.bg)).toBeGreaterThanOrEqual(3);
});

test('the quietest text on the page clears AA, in both themes', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);
  const worst = () =>
    page.evaluate(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      return [...document.querySelectorAll('p,span,h1,h2,h3,a,button')]
        .filter(
          (e) => e.textContent!.trim() && !e.children.length && (e as HTMLElement).offsetParent,
        )
        .map((e) => [getComputedStyle(e).color, bg]);
    });
  for (const [fg, bg] of await worst()) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  await page.keyboard.type('666');
  await page.waitForTimeout(900);
  for (const [fg, bg] of await worst()) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
});

test.describe('terminal keyboard', () => {
  test('Tab leaves the prompt and reaches the whole page', async ({ page }) => {
    await terminalReady(page);
    const stops = await rings(page, 24);
    const keys = stops.map((s) => s);
    expect(keys.length).toBeGreaterThanOrEqual(4);
    for (const s of stops) expect(s.color).toBe('rgb(34, 211, 238)');
    const labels = await page.evaluate(() =>
      [...document.querySelectorAll('a[aria-label]')].map((a) => a.getAttribute('aria-label')),
    );
    expect(labels.join(' ')).toMatch(/LinkedIn/);
  });

  test('Tab still completes when something is typed; Escape releases the prompt', async ({
    page,
  }) => {
    const input = await terminalReady(page);
    await input.focus();
    await page.keyboard.type('ski');
    await page.keyboard.press('Tab');
    await expect(input).toHaveValue('skills');
    await expect(input).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(input).not.toBeFocused();
    await input.focus();
    await input.fill('');
    await page.keyboard.press('Tab');
    await expect(input).not.toBeFocused();
  });
});
