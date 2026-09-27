import type { CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;

/** Newest first. Drafts never make it out. */
export function published(all: Note[]): Note[] {
  return all
    .filter((n) => !n.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const noteHref = (n: Note) => `/b-sides/${n.id}/`;

const two = (n: number) => String(n).padStart(2, '0');

/** '27.09', the way a tour date reads. */
export const day = (d: Date) => `${two(d.getUTCDate())}.${two(d.getUTCMonth() + 1)}`;

/** '27.09.2026', where there is no year heading around it. */
export const fullDate = (d: Date) => `${day(d)}.${d.getUTCFullYear()}`;

/** How many b-sides each entry has, by entry id. */
export function counts(notes: Note[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of notes) {
    const id = n.data.project?.id;
    if (id) out[id] = (out[id] ?? 0) + 1;
  }
  return out;
}

/** The note's text without markdown, for word counts and fallbacks. */
function plain(body = '') {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** At 200 words a minute, never under one. */
export const minutes = (n: Note) =>
  Math.max(1, Math.round(plain(n.body).split(' ').filter(Boolean).length / 200));

/** The summary, or the opening words cut at a word near 160 characters. */
export function summary(n: Note): string {
  if (n.data.summary) return n.data.summary;
  const text = plain(n.body);
  if (text.length <= 160) return text;
  return `${text.slice(0, 160).replace(/\s+\S*$/, '')}…`;
}
