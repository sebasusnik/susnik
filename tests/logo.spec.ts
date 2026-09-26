import { test, expect } from '@playwright/test';
import { countAudio, inverted, touch , phone } from './helpers';

test.describe('blood', () => {
  test('finds the tips and the first drop hangs within seconds', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => (window as any).__bleed?.tips().length)).toBe(14);
    await expect
      .poll(() => page.evaluate(() => (window as any).__bleed.state().hanging), { timeout: 9000 })
      .toBeGreaterThan(0);
  });
});

test.describe('666', () => {
  test('typed, it inverts, bleeds from the flipped tips, and comes back clean', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);
    await page.keyboard.type('666');
    await expect.poll(() => inverted(page)).toBe(true);
    expect(await page.evaluate(() => (window as any).__bleed.tips().length)).toBe(14);
    await expect
      .poll(() => page.evaluate(() => (window as any).__bleed.state().hanging))
      .toBeGreaterThanOrEqual(3);

    // A crossing locks for 720ms so two transitions cannot overlap.
    await page.waitForTimeout(800);
    await page.keyboard.type('666');
    await expect.poll(() => inverted(page)).toBe(false);
    const state = await page.evaluate(() => (window as any).__bleed.state());
    expect(state.hanging).toBe(0);
    expect(state.puddles).toBe(0);
  });

  test('staring at the logo reveals the hint, leaving hides it', async ({ page }) => {
    await page.goto('/');
    const opacity = () =>
      page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('hint')!).opacity));
    await page.locator('.logo').hover();
    await page.waitForTimeout(700);
    expect(await opacity()).toBeLessThan(0.05);
    await expect.poll(opacity, { timeout: 4000 }).toBeGreaterThan(0.5);
    await page.mouse.move(5, 5);
    await expect.poll(opacity, { timeout: 4000 }).toBeLessThan(0.05);
  });
});

test.describe('hold the beast', () => {
  test.use({ ...phone });

  async function press(page: import('@playwright/test').Page, ms: number, tremorPx = 0) {
    const audio = await countAudio(page);
    await page.goto('/');
    await page.waitForTimeout(1200);
    const box = (await page.locator('.logo').boundingBox())!;
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    const t = await touch(page);
    const start = Date.now();
    await t.down(x, y);
    while (Date.now() - start < ms) {
      if (tremorPx) await t.move(x + (Math.random() - 0.5) * tremorPx * 2, y + (Math.random() - 0.5) * tremorPx * 2);
      await page.waitForTimeout(40);
    }
    await t.up();
    await page.waitForTimeout(700);
    return { inverted: await inverted(page), audio: await audio() };
  }

  test('a deliberate press inverts and stings', async ({ page }) => {
    const r = await press(page, 1400);
    expect(r.inverted).toBe(true);
    expect(r.audio).toBe(1);
  });

  for (const [name, ms, tremor] of [
    ['a tap', 120, 0],
    ['a thumb resting 600ms', 600, 0],
    ['a thumb resting 850ms', 850, 0],
    ['a press that wanders 20px', 1400, 20],
  ] as const) {
    test(`${name} does nothing`, async ({ page }) => {
      const r = await press(page, ms, tremor);
      expect(r.inverted).toBe(false);
      expect(r.audio).toBe(0);
    });
  }

  test('the long press never offers to save the image', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('.logo');
    await expect(logo).toHaveClass(/\[-webkit-touch-callout:none\]/);
    await expect(logo.locator('img')).toHaveAttribute('draggable', 'false');
    const prevented = await page.evaluate(() => {
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      document.querySelector('.logo')!.dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(prevented).toBe(true);
  });

  test('the hint reads hold the beast under a finger', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hint')).toHaveText(/hold the beast/i);
  });
});

test('on a desktop, right-click is never blocked', async ({ page }) => {
  await page.goto('/');
  const prevented = await page.evaluate(() =>
    ['.logo', 'main'].map((sel) => {
      const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      document.querySelector(sel)!.dispatchEvent(e);
      return e.defaultPrevented;
    }));
  expect(prevented).toEqual([false, false]);
});
