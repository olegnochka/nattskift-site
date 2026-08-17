// Dependency-free internal link checker. Walks dist/**/*.html, extracts
// href/src/srcset, and verifies every internal URL resolves to a built
// file. Run `npm run build` first, then `npm run linkcheck`.
import { readdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

async function resolves(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (clean === '') return true; // pure fragment
  const rel = clean.replace(/^\//, '');
  const candidates = [
    path.join(dist, rel),
    path.join(dist, rel, 'index.html'),
    path.join(dist, rel.replace(/\/$/, '') + '.html'),
  ];
  for (const candidate of candidates) {
    if (await exists(candidate)) return true;
  }
  return false;
}

const external = (url) =>
  /^(https?:|mailto:|tel:|data:|#)/.test(url);

let checked = 0;
let broken = [];
const seen = new Map();

try {
  await stat(dist);
} catch {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

for await (const file of htmlFiles(dist)) {
  const html = await readFile(file, 'utf8');
  const urls = new Set();
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    urls.add(match[1]);
  }
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of match[1].split(',')) {
      urls.add(part.trim().split(/\s+/)[0]);
    }
  }
  for (const url of urls) {
    if (external(url)) continue;
    checked++;
    if (!seen.has(url)) seen.set(url, await resolves(url));
    if (!seen.get(url)) {
      broken.push({ page: path.relative(dist, file), url });
    }
  }
}

if (broken.length) {
  console.error(`${broken.length} broken internal link(s):`);
  for (const b of broken) console.error(`  ${b.page} -> ${b.url}`);
  process.exit(1);
}
console.log(`linkcheck: ${checked} internal references checked across dist/, all resolve.`);
