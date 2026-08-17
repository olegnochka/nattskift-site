// Generates 1200x630 Open Graph images at build time: sharp + Pango text
// with the vendored Archivo TTF (scripts/fonts/). No headless browser, no
// extra dependency. All text stays inside the central 1000x500 safe zone
// (x 100–1100, y 65–565). Output lands in public/og/ (gitignored).
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'og');
const gamesDir = path.join(root, 'src', 'content', 'games');
const archivo = path.join(root, 'scripts', 'fonts', 'Archivo.ttf');

const W = 1200;
const H = 630;
const INK = '#0B0E12';
const ROYAL = '#6B3FA0';
const TEXT = '#ECEFF3';
const MUTED = '#9AA4B2';

const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function textLayer(markup, font, width) {
  const buf = await sharp({
    text: { text: markup, font, fontfile: archivo, rgba: true, width },
  })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

// The split-square monogram N, drawn at badge size on the royal band.
const monogramSvg = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
      <rect width="512" height="256" fill="${INK}"/>
      <rect y="256" width="512" height="256" fill="${ROYAL}"/>
      <path fill="#FFFFFF" d="M186 58 L232 58 L292 166 L292 58 L326 58 L326 198 L280 198 L220 90 L220 198 L186 198 Z"/>
    </svg>`,
  );

async function makeCard(file, title, subtitle) {
  const bandTop = 470;
  const layers = [
    // royal band across the bottom — the lockup's bottom half, abstracted
    {
      input: Buffer.from(
        `<svg width="${W}" height="${H}"><rect y="${bandTop}" width="${W}" height="${H - bandTop}" fill="${ROYAL}"/></svg>`,
      ),
      top: 0,
      left: 0,
    },
  ];

  const titleLayer = await textLayer(
    `<span foreground="${TEXT}">${esc(title)}</span>`,
    'Archivo Semi-Bold 58',
    1000,
  );
  layers.push({ input: titleLayer.buf, left: 100, top: 150 });

  if (subtitle) {
    const subLayer = await textLayer(
      `<span foreground="${MUTED}">${esc(subtitle)}</span>`,
      'Archivo Medium 30',
      1000,
    );
    layers.push({ input: subLayer.buf, left: 100, top: 170 + titleLayer.height + 24 });
  }

  // brand line inside the band, still inside the safe zone
  const brand = await textLayer(
    `<span foreground="#F7F5F0" letter_spacing="6144">NATTSKIFT GAMES</span>`,
    'Archivo Medium 26',
    900,
  );
  layers.push({ input: brand.buf, left: 176, top: bandTop + 47 });
  layers.push({ input: monogramSvg(56), left: 100, top: bandTop + 34 });

  const out = path.join(outDir, file);
  await sharp({ create: { width: W, height: H, channels: 4, background: INK } })
    .composite(layers)
    .png()
    .toFile(out);
  console.log('og:', file);
}

await mkdir(outDir, { recursive: true });

const staticCards = [
  ['default.png', 'Made on the night shift.', 'iOS games by one person in Los Angeles. No ads, no timers.'],
  ['games.png', 'The games', 'Free to try, priced in real money, finished before they shipped.'],
  ['about.png', 'About the studio', 'Nattskift means night shift. The studio is one person in Los Angeles.'],
  ['press.png', 'Press', 'Fact sheet and assets. No form, no gate, no "request access."'],
  ['notes.png', 'Notes', 'Short notes from the night shift. What got built, what got cut, and why.'],
  ['privacy.png', 'Site privacy', 'No cookies, no analytics, no forms. The whole policy fits on one page.'],
];

for (const [file, title, subtitle] of staticCards) {
  await makeCard(file, title, subtitle);
}

for (const entry of await readdir(gamesDir)) {
  if (!entry.endsWith('.json')) continue;
  const id = entry.replace(/\.json$/, '');
  const game = JSON.parse(await readFile(path.join(gamesDir, entry), 'utf8'));
  await makeCard(`${id}.png`, game.title, game.hook);
  await makeCard(`${id}-support.png`, `${game.title} support`, 'Email a human. Replies usually within two days.');
  await makeCard(`${id}-privacy.png`, `${game.title} privacy`, 'No accounts, no analytics, no ad SDK. The short version is the whole version.');
}
