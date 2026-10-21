import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One JSON file in src/content/games/ = one game = four routes
 * (/games/[id], /games/[id]/support, /games/[id]/privacy, plus its
 * footer links, homepage card, and OG image).
 * Drop in a new file and the whole site picks it up.
 */
const games = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
    title: z.string(),
    /** Sort order on /games and the homepage slate. */
    order: z.number(),
    /** Hides the game everywhere on the site: lists, footer, its pages and the sitemap. The JSON stays, so
     *  un-hiding is one word. */
    hidden: z.boolean().default(false),
    /** Page metadata: title under 60 chars, description 150–160 chars. */
    seo: z.object({
      title: z.string().max(60),
      description: z.string(),
      supportTitle: z.string().max(60),
      supportDescription: z.string(),
      privacyTitle: z.string().max(60),
      privacyDescription: z.string(),
    }),
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
    /** Pre-release: replaces the App Store badge with a notify-me email form. */
    comingSoon: z.boolean().default(false),
    keyArt: z.object({ src: image(), alt: z.string() }),
    /** Optional App Store icon (square, 1024 px), shown next to the title on the game page. */
    appIcon: z.object({ src: image(), alt: z.string() }).optional(),
    /** Optional full-page ambient background (decorative, heavily darkened). */
    pageBackground: image().optional(),
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
    /** Real device captures only - as many as the game actually has public. */
    screenshots: z
      .array(z.object({ src: image(), alt: z.string() }))
      .min(3)
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
    /** Omitted for a game with no published changelog yet. */
    latestUpdate: z
      .object({
        version: z.string(),
        date: z.string(),
        changes: z.array(z.string()).length(3),
      })
      .optional(),
    /** Support page hosted elsewhere (and linked from the app). Skips /games/<id>/support. */
    supportUrl: z.string().url().optional(),
    /** Privacy policy hosted elsewhere. Skips /games/<id>/privacy. */
    privacyUrl: z.string().url().optional(),
    support: z.object({
      /** Honest response time, stated on the support page. */
      responseTime: z.string(),
      /** The address this game's app uses for support. Defaults to info@nattskiftgames.com. */
      email: z.string().email().optional(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })),
    }).optional(),
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
    }).optional(),
    /** Optional terms of use. Adds /games/<id>/terms and a Terms link. */
    terms: z.object({
      updated: z.string(),
      sections: z.array(z.object({ heading: z.string(), body: z.string() })),
    }).optional(),
  }).superRefine((g, ctx) => {
    if (!g.supportUrl && !g.support) ctx.addIssue({ code: 'custom', path: ['support'], message: 'support is required unless supportUrl is set' });
    if (!g.privacyUrl && !g.privacy) ctx.addIssue({ code: 'custom', path: ['privacy'], message: 'privacy is required unless privacyUrl is set' });
    // A game shown on the site carries a full set of documents here: support, privacy and terms.
    if (!g.hidden && !g.terms) ctx.addIssue({ code: 'custom', path: ['terms'], message: 'terms are required for a game shown on the site' });
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
