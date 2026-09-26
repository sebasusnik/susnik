import { test, expect } from '@playwright/test';
import { phone } from './helpers';

test('an unknown path is a real 404 that says no signal', async ({ page }) => {
  const res = await page.goto('/a-path-that-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.locator('main h1')).toHaveText(/no signal/i);
  await expect(page.locator('#signal-path')).toContainText('a-path-that-does-not-exist');
  await expect(page.getByRole('link', { name: /setlist/i })).toBeVisible();
  await expect(page).toHaveTitle(/no signal/i);
});

test('the static moves, and the logo surfaces out of it', async ({ page }) => {
  await page.goto('/nothing-here');
  await page.waitForTimeout(800);
  const sample = () =>
    page.evaluate(() => {
      const c = document.getElementById('static') as HTMLCanvasElement;
      return c.getContext('2d')!.getImageData(0, 0, 12, 12).data.join(',');
    });
  const a = await sample();
  await page.waitForTimeout(120);
  expect(await sample()).not.toBe(a);

  // The logo covers a fraction of the canvas, so compare its region to the edge.
  const ratio = () =>
    page.evaluate(() => {
      const cv = document.getElementById('static') as HTMLCanvasElement;
      const g = cv.getContext('2d')!;
      const avg = (d: Uint8ClampedArray) => { let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i]; return s / (d.length / 4); };
      const mid = g.getImageData(cv.width * 0.25 | 0, cv.height * 0.35 | 0, cv.width * 0.5 | 0, cv.height * 0.3 | 0).data;
      const edge = g.getImageData(0, 0, cv.width * 0.12 | 0, cv.height).data;
      return avg(mid) / avg(edge);
    });
  const plain = await ratio();
  await page.evaluate(() => (window as any).__surface());
  await page.waitForTimeout(60);
  expect(await ratio()).toBeGreaterThan(plain * 1.25);
});

test('its text stays readable over the static', async ({ page }) => {
  await page.goto('/nothing-here');
  await page.waitForTimeout(800);
  const worst = await page.evaluate(() => {
    const lum = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const cv = document.getElementById('static') as HTMLCanvasElement;
    const scale = cv.width / window.innerWidth;
    const op = parseFloat(getComputedStyle(cv).opacity);
    const el = [...document.querySelectorAll('p')].find((e) => e.textContent!.includes('broadcasting'))!;
    const b = el.getBoundingClientRect();
    const px = cv.getContext('2d')!.getImageData(b.left * scale | 0, b.top * scale | 0,
      Math.max(1, b.width * scale | 0), Math.max(1, b.height * scale | 0)).data;
    let max = 0;
    for (let i = 0; i < px.length; i += 4) max = Math.max(max, px[i] * op);
    const fg = Number(getComputedStyle(el).color.match(/\d+/)![0]);
    const [hi, lo] = [lum(fg), lum(max)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  });
  expect(worst).toBeGreaterThanOrEqual(4.5);
});

test('under reduced motion the static holds still', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/nothing-here');
  await page.waitForTimeout(800);
  const sample = () =>
    page.evaluate(() =>
      (document.getElementById('static') as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 10, 10).data.join(','));
  const a = await sample();
  await page.waitForTimeout(400);
  expect(await sample()).toBe(a);
  await ctx.close();
});

test('fits a phone without overflowing', async ({ browser }) => {
  const ctx = await browser.newContext({ ...phone });
  const page = await ctx.newPage();
  await page.goto('/a/very/long/path/that/should/wrap/rather/than/spill/off/the/screen');
  const over = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(over).toBe(false);
  await ctx.close();
});
