import { expect, test } from '@playwright/test';
import { terminalReady } from './helpers';

const log = (page: import('@playwright/test').Page) => page.locator('[role="log"]').nth(1);

test('a deep link opens straight onto its section', async ({ page }) => {
  await page.goto('/terminal#exp');
  await page.locator('.terminal-handle').waitFor();
  await expect(log(page)).toContainText('Winclap');
  await expect(log(page)).not.toContainText('build stuff');
});

test('Tab lists ambiguous candidates once, however often it is pressed', async ({ page }) => {
  const input = await terminalReady(page);
  const baseline = await log(page).locator('button:text-is("contact")').count();
  await input.focus();
  await page.keyboard.type('c');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  await expect(log(page).locator('button:text-is("contact")')).toHaveCount(baseline + 1);
});

test('Ctrl+C interrupts, and finished output never replays afterwards', async ({ page }) => {
  const input = await terminalReady(page);
  await input.focus();
  await page.keyboard.type('about');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  await page.keyboard.press('Control+c');
  await expect(log(page)).toContainText('^C');
  await expect(log(page)).toContainText('Outside work');

  const before = (await log(page).innerText()).length;
  const lengths: number[] = [];
  await page.keyboard.type('about');
  await page.keyboard.press('Enter');
  for (let i = 0; i < 20; i++) {
    lengths.push((await log(page).innerText()).length);
    await page.waitForTimeout(60);
  }
  expect(Math.min(...lengths)).toBeGreaterThanOrEqual(before);
});

test('Ctrl+L clears the screen', async ({ page }) => {
  await terminalReady(page);
  await page.keyboard.press('Control+l');
  await expect(log(page)).not.toContainText('Winclap');
});

test('a typo gets a suggestion that runs when clicked', async ({ page }) => {
  const input = await terminalReady(page);
  await input.focus();
  await page.keyboard.type('exo');
  await page.keyboard.press('Enter');
  await expect(log(page)).toContainText('Did you mean');
  await log(page).getByRole('button', { name: 'exp', exact: true }).last().click();
  await expect(log(page)).toContainText('Winclap');
  expect(page.url()).toMatch(/#exp$/);
});

for (const corner of ['bottomLeft', 'topLeft', 'bottomRight', 'topRight'] as const) {
  test(`resizing from ${corner} keeps the opposite edges fixed`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/terminal');
    await page.locator('.terminal-handle').waitFor();
    const win = page.locator('.react-draggable').first();
    const before = (await win.boundingBox())!;
    const left = corner.includes('Left'),
      bottom = corner.startsWith('bottom');
    const x = left ? before.x + 3 : before.x + before.width - 3;
    const y = bottom ? before.y + before.height - 3 : before.y + 3;
    const dx = left ? -110 : 110,
      dy = bottom ? 80 : -80;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 12 });
    await page.mouse.up();
    const after = (await win.boundingBox())!;

    expect(Math.abs(after.width - before.width - 110)).toBeLessThan(22);
    expect(Math.abs(after.height - before.height - 80)).toBeLessThan(22);
    const fixedX = left ? after.x + after.width - (before.x + before.width) : after.x - before.x;
    const fixedY = bottom
      ? after.y - before.y
      : after.y + after.height - (before.y + before.height);
    expect(Math.abs(fixedX)).toBeLessThan(14);
    expect(Math.abs(fixedY)).toBeLessThan(14);
  });
}

test('the window cannot be dragged off the top or the left', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/terminal');
  const handle = page.locator('.terminal-handle');
  await handle.waitFor();
  const win = page.locator('.react-draggable').first();

  const grab = (await handle.boundingBox())!;
  const x = grab.x + grab.width / 2;
  const y = grab.y + grab.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 2000, y - 2000, { steps: 15 });
  await page.mouse.up();

  const box = (await win.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  // And the title bar is still there to drag it back by.
  await expect(handle).toBeInViewport();
});
