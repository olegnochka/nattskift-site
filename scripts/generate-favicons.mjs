// Generates the favicon set from the split-square monogram
// (src/assets/brand/monogram.svg). Runs before `astro build`; outputs land
// in public/ and are gitignored. No dependencies beyond sharp, which Astro
// already uses for image optimization.
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const monogramPath = path.join(root, 'src', 'assets', 'brand', 'monogram.svg');
const publicDir = path.join(root, 'public');

const svg = await readFile(monogramPath);

const sizes = [
  { size: 16, file: 'favicon-16.png' },
  { size: 32, file: 'favicon-32.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
];

const pngs = {};
for (const { size, file } of sizes) {
  const buf = await sharp(svg, { density: 300 }).resize(size, size).png().toBuffer();
  pngs[size] = buf;
  await writeFile(path.join(publicDir, file), buf);
}

// favicon.ico: PNG-in-ICO container (16 + 32), written by hand — the format
// is a 6-byte header, 16-byte directory entries, then the image blobs.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, buf } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

await writeFile(
  path.join(publicDir, 'favicon.ico'),
  buildIco([
    { size: 16, buf: pngs[16] },
    { size: 32, buf: pngs[32] },
  ]),
);

await copyFile(monogramPath, path.join(publicDir, 'favicon.svg'));

console.log('favicons: favicon.ico, favicon.svg, 5 PNG sizes');
