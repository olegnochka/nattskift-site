// Writes public/llms.txt: a plain-language summary of the studio and every game shown
// on the site, for AI assistants. Built from the same JSON as the pages, so it never drifts.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const gamesDir = path.join(root, 'src', 'content', 'games');
const site = 'https://nattskiftgames.com';

const games = [];
for (const file of (await readdir(gamesDir)).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(await readFile(path.join(gamesDir, file), 'utf8'));
  if (data.hidden) continue;
  games.push({ id: file.replace(/\.json$/, ''), ...data });
}
games.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

const lines = [
  '# Nattskift Games',
  '',
  '> A tiny team in Los Angeles making iOS games that are finished when they ship, free to start, and honest about what they cost. No ads and no dark patterns.',
  '',
  `- Home: ${site}/`,
  `- Games: ${site}/games/`,
  `- About the studio, and how it makes money: ${site}/about/`,
  `- Site privacy: ${site}/privacy/`,
  '- Contact: info@nattskiftgames.com',
  '',
  '## Games',
  '',
];
for (const g of games) {
  const status = g.comingSoon ? 'coming soon' : `live on the App Store: https://apps.apple.com/app/id${g.appStoreId}`;
  lines.push(`### ${g.title}`, '');
  lines.push(`${g.hook} ${g.seo?.description ?? ''}`.trim(), '');
  lines.push(`- Status: ${status}`);
  lines.push(`- Genre: ${g.tags.genre}; platform: ${g.facts?.platform ?? g.tags.platform}; price: ${g.facts?.price ?? g.tags.price}`);
  if (g.deal?.never?.length) lines.push(`- Never: ${g.deal.never.join(' ')}`);
  lines.push(`- Page: ${site}/games/${g.id}/`);
  lines.push(`- Support: ${g.supportUrl ?? `${site}/games/${g.id}/support/`}${g.support?.email ? ` (email ${g.support.email})` : ''}`);
  lines.push(`- Privacy: ${g.privacyUrl ?? `${site}/games/${g.id}/privacy/`}`);
  if (g.terms) lines.push(`- Terms: ${site}/games/${g.id}/terms/`);
  lines.push('');
}
await writeFile(path.join(root, 'public', 'llms.txt'), lines.join('\n'));
console.log(`llms.txt: ${games.length} games`);
