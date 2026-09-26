import { test, expect } from '@playwright/test';

// Tatum's row on the setlist; the entry has no page of its own yet.
const PAGE = '/';
const MP3 = /\/audio\/tatum-detroit\.mp3$/;

test('the waveform is there before the track is, and the track waits for play', async ({ page }) => {
  const fetched: string[] = [];
  page.on('request', (r) => fetched.push(r.url()));
  await page.goto(PAGE);

  await expect(page.locator('[data-seek] svg path')).toHaveCount(4);
  await expect(page.locator('[data-clip]')).toHaveAttribute('width', '0');
  await expect(page.locator('[data-seek]')).toHaveAttribute('aria-valuetext', '0:00 of 2:57');
  await page.waitForTimeout(1000);
  expect(fetched.some((u) => MP3.test(u))).toBe(false);

  await page.getByRole('button', { name: 'Play After Midnight' }).click();
  await expect(page.getByRole('button', { name: 'Pause After Midnight' })).toBeVisible();
  await expect
    .poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.currentTime), { timeout: 8000 })
    .toBeGreaterThan(0.3);
  expect(fetched.some((u) => MP3.test(u))).toBe(true);

  await page.getByRole('button', { name: 'Pause After Midnight' }).click();
  await expect(page.getByRole('button', { name: 'Play After Midnight' })).toBeVisible();
});

test('the waveform seeks by click and by keyboard', async ({ page }) => {
  await page.goto(PAGE);
  const seek = page.getByRole('slider', { name: 'Seek' });
  await seek.scrollIntoViewIfNeeded();

  const box = (await seek.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(seek).toHaveAttribute('aria-valuenow', /^(88|89)$/);
  await expect(page.locator('[data-now]')).toHaveText(/^1:2[89]$/);
  // Half of it red, and the line halfway across.
  expect(Number(await page.locator('[data-clip]').getAttribute('width'))).toBeCloseTo(500, -1);
  const head = (await page.locator('[data-head]').boundingBox())!;
  expect(Math.abs(head.x + head.width / 2 - (box.x + box.width / 2))).toBeLessThan(2);

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

test.describe('on the setlist', () => {
  test('it sits under its row and filters with it', async ({ page }) => {
    await page.goto('/');
    const player = page.locator('[data-track] .player');
    await expect(player).toBeVisible();
    await expect(page.locator('[data-track] audio')).toHaveAttribute('preload', 'none');

    await page.locator('[data-filter="code"]').click();
    await expect(player).toBeHidden();
    await page.locator('[data-filter="sound"]').click();
    await expect(player).toBeVisible();
  });

  test('play turns the drone off', async ({ page }) => {
    await page.goto('/');
    await page.locator('#drone').click();
    await expect(page.locator('#drone')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^Play / }).click();
    await expect(page.locator('#drone')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#drone')).toHaveText('▶ drone');
  });
});
