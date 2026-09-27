import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { noteHref, published, summary } from '../../lib/notes';

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The b-sides as RSS 2.0. Twenty lines is not worth a dependency either. */
export const GET: APIRoute = async ({ site }) => {
  const notes = published(await getCollection('notes'));
  const home = new URL('/b-sides/', site).href;

  const items = notes
    .map((n) => {
      const url = new URL(noteHref(n), site).href;
      return [
        '    <item>',
        `      <title>${xml(n.data.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${n.data.date.toUTCString()}</pubDate>`,
        `      <description>${xml(summary(n))}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0">',
      '  <channel>',
      '    <title>B-sides — Sebastián Sušnik</title>',
      `    <link>${home}</link>`,
      '    <description>Notes that go with the things on the setlist.</description>',
      items,
      '  </channel>',
      '</rss>',
      '',
    ]
      .filter(Boolean)
      .join('\n'),
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
};
