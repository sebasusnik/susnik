import { expect, test } from '@playwright/test';
import { countAudio } from './helpers';

test('nothing makes a sound without a gesture', async ({ page }) => {
  const audio = await countAudio(page);
  await page.goto('/');
  await page.waitForTimeout(6000);
  for (let i = 0; i < 15; i++) await page.mouse.wheel(0, 400);
  const box = (await page.locator('.logo').boundingBox())!;
  await page.mouse.wheel(0, -9000);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
  expect(await audio()).toBe(0);
});

test.describe('drone', () => {
  const read = (page: import('@playwright/test').Page) =>
    page.evaluate(() => (window as any).__drone());

  test('scroll speed opens the filter and it sinks back when you stop', async ({ page }) => {
    await page.goto('/');
    await page.locator('#drone').click();
    await page.waitForTimeout(500);

    const rest = await read(page);
    expect(rest.cutoff).toBeLessThan(260);
    expect(rest.drive).toBeLessThan(1.15);

    let peak = rest;
    for (let i = 0; i < 16; i++) {
      await page.mouse.wheel(0, 340);
      await page.waitForTimeout(28);
      const s = await read(page);
      if (s.cutoff > peak.cutoff) peak = s;
    }
    expect(peak.cutoff).toBeGreaterThan(420);
    expect(peak.drive).toBeGreaterThan(1.8);
    expect(peak.trim).toBeLessThan(0.4); // the trim gives the loudness back

    await expect.poll(async () => (await read(page)).cutoff, { timeout: 4000 }).toBeLessThan(300);

    await page.locator('#drone').click();
    await expect.poll(() => read(page)).toBeNull();
  });
});

test.describe('the 666 sting', () => {
  test('sounds once, on the way in only', async ({ page }) => {
    const audio = await countAudio(page);
    await page.goto('/');
    await page.waitForTimeout(600);
    await page.keyboard.type('666');
    await expect.poll(audio).toBe(1);
    await page.keyboard.type('666');
    await page.waitForTimeout(900);
    expect(await audio()).toBe(1);
  });

  test('ducks the drone instead of piling on top of it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#drone').click();
    await page.waitForTimeout(4200); // the drone fades up over four seconds
    const master = () => page.evaluate(() => (window as any).__droneMaster());
    const before = await master();
    await page.keyboard.type('666');
    await page.waitForTimeout(250);
    expect(await master()).toBeLessThan(before * 0.5);
    await expect.poll(master, { timeout: 4000 }).toBeGreaterThan(before * 0.8);
  });
});
