import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../public/resume.pdf');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(`file://${resolve(here, 'resume.html')}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700);            // webfonts settle before layout is measured
await page.pdf({ path: out, format: 'A4', printBackground: true });
await browser.close();
console.log(`wrote ${out}`);
