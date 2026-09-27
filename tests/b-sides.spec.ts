import { expect, test } from '@playwright/test';
import { entries, notes } from './helpers';

// Written against the fixtures in tests/fixtures/notes. A deployment has
// whatever notes are real at the time, so this file only runs locally.
test.skip(!!process.env.BASE_URL, 'runs against the fixtures, not a deployment');

const all = notes();

test('the newest b-side is announced above the setlist', async ({ page }) => {
  await page.goto('/');
  const block = page.locator('section[aria-label="New b-side"]');
  await expect(block).toContainText(/new b-side/i);
  const row = block.locator('[data-note]');
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(all[0].title);
  await expect(row).toHaveAttribute('href', `/b-sides/${all[0].id}/`);
  // It comes before the setlist.
  const [announced, setlist] = await Promise.all([
    block.evaluate((e) => e.getBoundingClientRect().top),
    page.getByRole('heading', { name: 'setlist' }).evaluate((e) => e.getBoundingClientRect().top),
  ]);
  expect(announced).toBeLessThan(setlist);
});

test('the setlist ends in the next five b-sides, set like tour dates', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="b-sides"]');
  const rows = section.locator('[data-note]');
  const rest = all.slice(1, 6);
  await expect(rows).toHaveCount(rest.length);
  await expect(rows.first()).toContainText(rest[0].title);
  await expect(rows.first()).toHaveAttribute('href', `/b-sides/${rest[0].id}/`);
  // The one announced above is not repeated, and a draft never shows.
  await expect(section).not.toContainText(all[0].title);
  await expect(section).not.toContainText('Un borrador');
  // Each says how long it takes to read, so it reads as a note, not an entry.
  for (const r of await rows.all()) await expect(r).toContainText(/\d+ min read/);
  await expect(section.getByRole('link', { name: /all b-sides/i })).toHaveAttribute(
    'href',
    '/b-sides/',
  );
});

test('an entry with b-sides counts them quietly and gets a page', async ({ page }) => {
  await page.goto('/');
  const tatum = entries().find((e) => e.id === 'tatum')!;
  const row = page.locator('[data-entry]', { has: page.locator('h3', { hasText: tatum.title }) });
  await expect(row.locator('[data-count]')).toHaveText(`· ${tatum.notes} b-sides`);
  await expect(row.locator('a.row')).toHaveAttribute('href', '/projects/tatum/');

  await page.goto('/projects/tatum/');
  const listed = page.locator('section[aria-labelledby="entry-b-sides"] [data-note]');
  await expect(listed).toHaveCount(tatum.notes);
});

test('/b-sides lists every one by year, and filters by entry', async ({ page }) => {
  await page.goto('/b-sides/');
  await expect(page.locator('[data-note]')).toHaveCount(all.length);
  const years = [...new Set(all.map((n) => n.date.slice(0, 4)))];
  await expect(page.locator('[data-year] h2')).toHaveText(years);

  await page.getByRole('button', { name: 'Drumgen', exact: false }).click();
  await expect(page.locator('[data-note]:visible')).toHaveCount(
    all.filter((n) => n.project === 'drumgen').length,
  );
  // A year with nothing left in it hides its heading as well.
  await expect(page.locator('[data-year]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'all', exact: true }).click();
  await expect(page.locator('[data-note]:visible')).toHaveCount(all.length);
});

test('a note page is in its own language, and says what it belongs to', async ({ page }) => {
  for (const n of all.filter((x) => x.project).slice(0, 4)) {
    await page.goto(`/b-sides/${n.id}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', n.lang);
    await expect(page.locator('h1')).toHaveText(n.title);
    await expect(page.getByRole('link', { name: /← b-sides/ })).toHaveAttribute(
      'href',
      '/b-sides/',
    );
    await expect(page.locator(`a[href="/projects/${n.project}/"]`)).toBeVisible();
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
    );
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld.inLanguage).toBe(n.lang);
  }
});

test('the feed and the sitemap carry every b-side', async ({ request }) => {
  const rss = await (await request.get('/b-sides/rss.xml')).text();
  expect(rss.match(/<item>/g)?.length).toBe(all.length);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const n of all) expect(sitemap).toContain(`/b-sides/${n.id}/`);
});
