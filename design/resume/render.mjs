import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
// `node render.mjs` renders the published CV; `node render.mjs draft.html draft.pdf`
// renders a draft next to it without touching public/.
const [input = 'resume.html', output] = process.argv.slice(2);
const out = output ? resolve(here, output) : resolve(here, '../../public/resume.pdf');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(`file://${resolve(here, input)}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700); // webfonts settle before layout is measured
await page.pdf({ path: out, format: 'A4', printBackground: true });
await browser.close();
console.log(`wrote ${out}`);
