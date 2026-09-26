import { expect, test } from '@playwright/test';
import { entries, phone } from './helpers';

const all = entries();

test.describe('setlist', () => {
  test.beforeEach(async ({ page }) => page.goto('/'));

  test('shows every published entry and no drafts', async ({ page }) => {
    await expect(page.locator('.row')).toHaveCount(all.length);
    await expect(page.locator('main')).not.toContainText(/an installation/i); // the template's title
  });

  test('the headliner comes first and is set bigger', async ({ page }) => {
    const first = page.locator('.row').first();
    await expect(first.locator('h3')).toHaveText(/pixfit/i);
    const size = await first
      .locator('h3')
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(size).toBeGreaterThan(20);
  });

  test('has one h1, one h2 and an h3 per entry', async ({ page }) => {
    const counts = await page.evaluate(() =>
      ['h1', 'h2', 'h3'].map((t) => document.body.querySelectorAll(t).length),
    );
    expect(counts).toEqual([1, 1, all.length]);
  });

  test('causes of death are shown', async ({ page }) => {
    await expect(page.locator('.row p.italic')).toHaveCount(all.filter((e) => e.cause).length);
  });

  test('filters narrow the list and all restores it', async ({ page }) => {
    const kinds = [...new Set(all.map((e) => e.kind))];
    for (const kind of kinds) {
      await page.getByRole('button', { name: kind!, exact: true }).click();
      await expect(page.locator('.row:visible')).toHaveCount(
        all.filter((e) => e.kind === kind).length,
      );
    }
    await page.getByRole('button', { name: 'all', exact: true }).click();
    await expect(page.locator('.row:visible')).toHaveCount(all.length);
  });

  test('rows link to their own page, straight out, or nowhere', async ({ page }) => {
    for (const e of all) {
      const row = page.locator('.row', { has: page.locator('h3', { hasText: e.title }) });
      const href = await row.getAttribute('href');
      if (e.hasBody) expect(href).toBe(`/projects/${e.id}/`);
      else if (e.link) {
        expect(href).toBe(e.link);
        await expect(row).toHaveAttribute('target', '_blank');
      } else expect(href).toBeNull();
    }
  });
});

test('entries whose source is about to go public say so', async ({ page }) => {
  await page.goto('/');
  for (const e of all) {
    const entry = page.locator('[data-entry]', { has: page.locator('h3', { hasText: e.title }) });
    const note = entry.getByText('Source goes public soon.');
    await expect(note).toHaveCount(e.soon ? 1 : 0);
  }
});

test('entries with a body render their own page', async ({ page }) => {
  for (const e of all.filter((x) => x.hasBody)) {
    const res = await page.goto(`/projects/${e.id}/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(e.title);
    await expect(page.getByRole('link', { name: /setlist/i })).toBeVisible();
  }
});

test('the CV, robots and sitemap are served', async ({ request }) => {
  for (const path of ['/resume.pdf', '/robots.txt', '/sitemap.xml', '/og.png']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

for (const width of [320, 390, 430]) {
  test(`no horizontal overflow at ${width}px`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...phone, viewport: { width, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(over).toBe(false);
    await ctx.close();
  });
}
