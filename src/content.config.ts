import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One JSON file in src/content/games/ = one game = four routes
 * (/games/[id], /games/[id]/support, /games/[id]/privacy, plus its
 * footer links, homepage card, press section, and OG image).
 * Drop in a new file and the whole site picks it up.
 */
const games = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
    title: z.string(),
    /** Sort order on /games and the homepage slate. */
    order: z.number(),
    /** One line. Shows under the title everywhere. */
    hook: z.string(),
    /** 40–60 words, second person, present tense. */
    pitch: z.string(),
    tags: z.object({
      genre: z.string(),
      platform: z.string(),
      price: z.string(),
    }),
    /** Apple App Store numeric id. Placeholder until the app is live. */
    appStoreId: z.string(),
    keyArt: z.object({ src: image(), alt: z.string() }),
    trailer: z
      .object({
        /** Poster shown until click; nothing third-party loads before that. */
        poster: image(),
        posterAlt: z.string(),
        /** youtube-nocookie embed URL. */
        embedUrl: z.string(),
      })
      .nullable(),
    pillars: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          image: image(),
          alt: z.string(),
        }),
      )
      .length(3),
    screenshots: z
      .array(z.object({ src: image(), alt: z.string() }))
      .min(6)
      .max(8),
    /** The explicit monetization statement. Rendered on royal fill. */
    deal: z.object({
      free: z.string(),
      paid: z.string(),
      costs: z.string(),
      never: z.array(z.string()),
    }),
    facts: z.object({
      platform: z.string(),
      minimumOS: z.string(),
      size: z.string(),
      languages: z.string(),
      releaseDate: z.string(),
      price: z.string(),
      engine: z.string(),
      developer: z.string(),
    }),
    latestUpdate: z.object({
      version: z.string(),
      date: z.string(),
      changes: z.array(z.string()).length(3),
    }),
    support: z.object({
      /** Honest response time, stated on the support page. */
      responseTime: z.string(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })),
    }),
    privacy: z.object({
      updated: z.string(),
      summary: z.array(
        z.object({
          what: z.string(),
          why: z.string(),
          whoSees: z.string(),
          howToDelete: z.string(),
        }),
      ),
      sections: z.array(z.object({ heading: z.string(), body: z.string() })),
    }),
    press: z.object({
      blurb: z.string(),
      facts: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
  }),
});

export const collections = { games, notes };
