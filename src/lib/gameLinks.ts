import type { CollectionEntry } from 'astro:content';

/**
 * Where a game's support and privacy links point. Most games get pages on
 * this site; a game whose pages already live elsewhere (and are linked from
 * the App Store and the app itself) sets supportUrl / privacyUrl instead, so
 * there is one copy of each policy, not two that can drift apart.
 */
type Game = CollectionEntry<'games'>;

export const supportHref = (game: Game) => game.data.supportUrl ?? `/games/${game.id}/support`;
export const privacyHref = (game: Game) => game.data.privacyUrl ?? `/games/${game.id}/privacy`;
/** The one support address for a game: the same one its app and its pages use. */
export const supportEmail = (game: Game) => game.data.support?.email ?? 'info@nattskiftgames.com';

/** The terms page, for a game that has one. */
export const termsHref = (game: Game) => (game.data.terms ? `/games/${game.id}/terms` : undefined);
export const isExternal = (href: string) => /^https?:\/\//.test(href);
