import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CDPSession, devices, type Page } from '@playwright/test';

/**
 * A phone's viewport, touch and user agent, without the preset's
 * defaultBrowserType: touch here goes through Chromium's CDP, and switching
 * browser inside a describe group is not allowed anyway.
 */
const { defaultBrowserType: _, ...phoneRest } = devices['iPhone 13'];
export const phone = phoneRest;

/**
 * The entries the setlist should show, read from the collection itself, so
 * adding or cutting a project does not break the suite.
 */
export function entries() {
  const dir = join(process.cwd(), 'src/content/projects');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: f.replace(/\.md$/, ''), text: readFileSync(join(dir, f), 'utf8') }))
    .filter((e) => !/^draft:\s*true/m.test(e.text))
    .map((e) => ({
      id: e.id,
      title: e.text.match(/^title:\s*(.+)$/m)?.[1].trim() ?? e.id,
      kind: e.text.match(/^kind:\s*(\w+)/m)?.[1],
      link: e.text.match(/^link:\s*(\S+)/m)?.[1],
      hasBody:
        e.text
          .split(/^---\s*$/m)
          .slice(2)
          .join('')
          .trim().length > 0,
      cause: /^cause:/m.test(e.text),
    }));
}

/** Terminal intro skipped and the prompt ready. */
export async function terminalReady(page: Page) {
  await page.goto('/terminal');
  await page.locator('.terminal-handle').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('input[data-terminal-input]:visible').waitFor();
  await page.waitForTimeout(400);
  return page.locator('input[data-terminal-input]:visible').first();
}

/** Raw touch through CDP; Playwright's touchscreen API cannot hold or drag. */
export async function touch(page: Page) {
  const cdp: CDPSession = await page.context().newCDPSession(page);
  const send = (type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number, y?: number) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: x === undefined ? [] : [{ x, y: y! }],
    });
  return {
    down: (x: number, y: number) => send('touchStart', x, y),
    move: (x: number, y: number) => send('touchMove', x, y),
    up: () => send('touchEnd'),
  };
}

/** Counts AudioContexts created, so a test can prove nothing made a sound. */
export async function countAudio(page: Page) {
  await page.addInitScript(() => {
    (window as any).__audio = 0;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args);
        (window as any).__audio++;
      }
    } as typeof AudioContext;
  });
  return () => page.evaluate(() => (window as any).__audio as number);
}

export const inverted = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('inverted'));

/** WCAG relative-luminance contrast between two rgb() strings. */
export function contrast(a: string, b: string) {
  const lum = (c: string) => {
    const [r, g, bl] = c
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
