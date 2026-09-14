import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** '2026.03', unless the entry says otherwise ('∞', '2024 —'). */
export function dateLabel(p: Project): string {
  if (p.data.dateLabel) return p.data.dateLabel;
  const d = p.data.date;
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Its own page when the file has a body, otherwise straight out to `link`.
 * Neither one, and the row is not a link at all.
 */
export function href(p: Project): string | undefined {
  if (p.body?.trim()) return `/projects/${p.id}/`;
  return p.data.link;
}

/** The right-hand label: `kind · status`, with kind struck out once it is over. */
export function tag(p: Project) {
  const kind = p.data.featured ? 'headliner' : p.data.kind;
  const dead = p.data.status === 'deceased';
  const status =
    p.data.status === 'alive' ? 'still alive'
    : p.data.status === 'undead' ? 'undead'
    : dead ? ['deceased', p.data.died].filter(Boolean).join(' ')
    : null;
  return { kind, dead, status };
}

/** Headliner first, then newest first. Drafts never make the list. */
export function setlist(all: Project[]): Project[] {
  return all
    .filter((p) => !p.data.draft)
    .sort((a, b) => {
      if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
      return b.data.date.getTime() - a.data.date.getTime();
    });
}

export const KINDS = ['code', 'hardware', 'sound', 'art', 'client'] as const;
