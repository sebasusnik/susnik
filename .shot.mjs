import { chromium } from '@playwright/test';

const b = await chromium.launch();
for (const [n, w, h] of [
  ['d', 1280, 800],
  ['m', 390, 844],
]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:4321/');
  await p.waitForTimeout(1500);
  const box = await p.locator('.hero p').nth(1).boundingBox();
  await p.screenshot({
    path: `/private/tmp/claude-501/hero-${n}.png`,
    clip: { x: 0, y: box.y - 20, width: w, height: box.height + 40 },
  });
}
await b.close();
