import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { href, setlist } from '../lib/entries';
import { counts, noteHref, published } from '../lib/notes';

/**
 * Three or four URLs is not worth a dependency. Entries only appear here when
 * they have a page of their own; the ones that link straight out belong to
 * whoever hosts them.
 */
export const GET: APIRoute = async ({ site }) => {
  const entries = setlist(await getCollection('projects'));
  const notes = published(await getCollection('notes'));
  const perEntry = counts(notes);
  const paths = [
    '/',
    '/terminal/',
    ...entries
      .map((e) => href(e, (perEntry[e.id] ?? 0) > 0))
      .filter((h): h is string => !!h && h.startsWith('/')),
    ...(notes.length ? ['/b-sides/', ...notes.map(noteHref)] : []),
  ];

  const urls = paths.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
