import { expect, test } from '@playwright/test';

// What a search engine reads before anyone sees the page.

test('the home page says whose it is', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Sebastián Susnik — Product Engineer');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Sebastián Susnik.*PixFit/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Sebastián Susnik — Product Engineer',
  );
  await expect(page.locator('h1 img')).toHaveAttribute('alt', 'Sebastián Susnik');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
});

test('structured data names the person, with and without the accent', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const graph = JSON.parse(raw ?? '{}')['@graph'] as Array<Record<string, unknown>>;
  const person = graph.find((n) => n['@type'] === 'Person')!;
  expect(person.name).toBe('Sebastián Susnik');
  expect(person.alternateName).toContain('Sebastian Susnik');
  expect(person.sameAs).toEqual(
    expect.arrayContaining([
      'https://github.com/sebasusnik',
      'https://www.linkedin.com/in/sebasusnik',
    ]),
  );
  expect(graph.some((n) => n['@type'] === 'WebSite')).toBe(true);
});

test('the terminal has a title and description of its own', async ({ page }) => {
  await page.goto('/terminal/');
  await expect(page).toHaveTitle('Terminal — Sebastián Susnik');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /terminal window/,
  );
});

test('the 404 stays out of search results', async ({ page }) => {
  await page.goto('/nothing-here');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('fonts are served from this site, not Google', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) external.push(r.url());
  });
  for (const path of ['/', '/terminal/']) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
  }
  expect(external).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('13px "JetBrains Mono Variable"'))).toBe(
    true,
  );
});
