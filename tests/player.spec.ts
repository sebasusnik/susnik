import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Tatum's row on the setlist. The track is read from the entry and its JSON,
// so swapping it for another one does not break these.
const PAGE = '/';
const entry = readFileSync('src/content/projects/tatum.md', 'utf8');
const SRC = entry.match(/^\s+src:\s*(\S+)/m)![1];
const TITLE = entry.match(/^\s+title:\s*(.+)$/m)![1].trim();
const MP3 = new RegExp(`/audio/${SRC}\\.mp3$`);
const DURATION: number = JSON.parse(readFileSync(`public/audio/${SRC}.json`, 'utf8')).duration;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const TOTAL = clock(DURATION);

test('the waveform is there before the track is, and the track waits for play', async ({
  page,
}) => {
  const fetched: string[] = [];
  page.on('request', (r) => fetched.push(r.url()));
  await page.goto(PAGE);

  await expect(page.locator('[data-seek] svg path')).toHaveCount(4);
  await expect(page.locator('[data-clip]')).toHaveAttribute('width', '0');
  await expect(page.locator('[data-seek]')).toHaveAttribute('aria-valuetext', `0:00 of ${TOTAL}`);
  await page.waitForTimeout(1000);
  expect(fetched.some((u) => MP3.test(u))).toBe(false);

  await page.getByRole('button', { name: `Play ${TITLE}` }).click();
  await expect(page.getByRole('button', { name: `Pause ${TITLE}` })).toBeVisible();
  await expect
    .poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.currentTime), {
      timeout: 8000,
    })
    .toBeGreaterThan(0.3);
  expect(fetched.some((u) => MP3.test(u))).toBe(true);

  await page.getByRole('button', { name: `Pause ${TITLE}` }).click();
  await expect(page.getByRole('button', { name: `Play ${TITLE}` })).toBeVisible();
});

test('pause fades out instead of cutting, and play during the fade keeps it going', async ({
  page,
}) => {
  await page.goto(PAGE);
  const paused = () => page.locator('audio').evaluate((a: HTMLAudioElement) => a.paused);
  const button = page.locator('.player [data-play]');
  await button.click();
  await expect
    .poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.currentTime), {
      timeout: 8000,
    })
    .toBeGreaterThan(0.3);

  // The element keeps playing through the 30 ms fade, then stops.
  await button.click();
  expect(await paused()).toBe(false);
  await expect.poll(paused).toBe(true);

  // Play again, and pause-then-play inside the fade: it never stops.
  await button.click();
  await expect.poll(paused).toBe(false);
  await button.evaluate((b: HTMLButtonElement) => {
    b.click();
    b.click();
  });
  await page.waitForTimeout(200);
  expect(await paused()).toBe(false);
  await expect(page.getByRole('button', { name: `Pause ${TITLE}` })).toBeVisible();
});

test('the waveform seeks by click and by keyboard', async ({ page }) => {
  await page.goto(PAGE);
  const seek = page.getByRole('slider', { name: 'Seek' });
  await seek.scrollIntoViewIfNeeded();

  const box = (await seek.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  // Halfway, give or take the second the click lands in.
  const half = Math.floor(DURATION / 2);
  await expect(seek).toHaveAttribute(
    'aria-valuenow',
    new RegExp(`^(${half - 1}|${half}|${half + 1})$`),
  );
  const now = await page.locator('[data-now]').textContent();
  expect([half - 1, half, half + 1].map(clock)).toContain(now);
  // Half of it red, and the line halfway across.
  expect(Number(await page.locator('[data-clip]').getAttribute('width'))).toBeCloseTo(500, -1);
  const head = (await page.locator('[data-head]').boundingBox())!;
  expect(Math.abs(head.x + head.width / 2 - (box.x + box.width / 2))).toBeLessThan(2);

  await seek.press('End');
  await expect(seek).toHaveAttribute('aria-valuenow', String(Math.round(DURATION)));
  await seek.press('Home');
  await seek.press('ArrowRight');
  await seek.press('ArrowRight');
  await expect(seek).toHaveAttribute('aria-valuetext', `0:10 of ${TOTAL}`);
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
