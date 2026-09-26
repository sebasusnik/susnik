import { test, expect } from '@playwright/test';

const PAGE = '/projects/tatum/';
const MP3 = /\/audio\/tatum-detroit\.mp3$/;

test('the waveform is there before the track is, and the track waits for play', async ({ page }) => {
  const fetched: string[] = [];
  page.on('request', (r) => fetched.push(r.url()));
  await page.goto(PAGE);

  await expect(page.locator('[data-seek] > span')).toHaveCount(120);
  await expect(page.locator('[data-seek]')).toHaveAttribute('aria-valuetext', '0:00 of 2:57');
  await page.waitForTimeout(1000);
  expect(fetched.some((u) => MP3.test(u))).toBe(false);

  await page.getByRole('button', { name: 'Play Belle Isle After Midnight' }).click();
  await expect(page.getByRole('button', { name: 'Pause Belle Isle After Midnight' })).toBeVisible();
  await expect
    .poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.currentTime), { timeout: 8000 })
    .toBeGreaterThan(0.3);
  expect(fetched.some((u) => MP3.test(u))).toBe(true);

  await page.getByRole('button', { name: 'Pause Belle Isle After Midnight' }).click();
  await expect(page.getByRole('button', { name: 'Play Belle Isle After Midnight' })).toBeVisible();
});

test('the waveform seeks by click and by keyboard', async ({ page }) => {
  await page.goto(PAGE);
  const seek = page.getByRole('slider', { name: 'Seek' });

  const box = (await seek.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(seek).toHaveAttribute('aria-valuenow', /^(88|89)$/);
  await expect(page.locator('[data-now]')).toHaveText(/^1:2[89]$/);

  await seek.press('End');
  await expect(seek).toHaveAttribute('aria-valuenow', '177');
  await seek.press('Home');
  await seek.press('ArrowRight');
  await seek.press('ArrowRight');
  await expect(seek).toHaveAttribute('aria-valuetext', '0:10 of 2:57');
  await seek.press('ArrowLeft');
  await expect(seek).toHaveAttribute('aria-valuenow', '5');
});

test('the track and the drone never play together', async ({ page }) => {
  await page.goto(PAGE);
  const paused = () => page.locator('audio').evaluate((a: HTMLAudioElement) => a.paused);

  await page.locator('#drone').click();
  await expect(page.locator('#drone')).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /^Play / }).click();
  await expect(page.locator('#drone')).toHaveAttribute('aria-pressed', 'false');
  expect(await paused()).toBe(false);

  await page.locator('#drone').click();
  await expect(page.locator('#drone')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(paused).toBe(true);
});
