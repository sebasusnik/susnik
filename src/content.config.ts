import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One file per thing I made. Code, circuits, noise, installations — the list
 * does not care which, it only sorts by date and colours by `kind`.
 *
 * An entry with a body gets its own page. An entry without one links straight
 * out to `link`, because a repo README says more than a page that repeats it.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** Sorts the setlist. Use the first day of the month for month precision. */
    date: z.coerce.date(),
    /** Shown instead of the date when the date alone lies: '∞', '2024 —'. */
    dateLabel: z.string().optional(),
    kind: z.enum(['code', 'hardware', 'sound', 'art', 'client']),
    summary: z.string(),
    /** Second line, for the headliner only: what it is built out of. */
    stack: z.string().optional(),
    link: z.string().url().optional(),
    /**
     * alive: still being worked on. undead: never finishes, never dies.
     * deceased: over, and `died` says when.
     */
    /**
     * alive: still being worked on. undead: never finishes, never quite dies.
     * deceased: over, and `died` says when. Leave it off and the entry is
     * simply done — it works, there is nothing more to say about it.
     */
    status: z.enum(['alive', 'undead', 'deceased']).optional(),
    died: z.string().optional(),
    /** Why it stopped. Honest beats polished; it shows under the summary. */
    cause: z.string().optional(),
    /** The one at the top, set bigger. Exactly one entry should have it. */
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
