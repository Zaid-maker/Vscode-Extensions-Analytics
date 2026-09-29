// Generates public/apple-touch-icon.png (180x180) and public/favicon.ico (16/32/48).
// Usage: npm i --no-save @resvg/resvg-js && node scripts/generate-icons.mjs
// The touch icon is full-bleed (no transparency): iOS applies its own rounded mask.

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');
const TOUCH_PATH = join(OUT_DIR, 'apple-touch-icon.png');
const ICO_PATH = join(OUT_DIR, 'favicon.ico');

const svg = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" fill="url(#g)"/>
  <path d="M30 96h28l16-44 22 88 18-52 12 8h24"
        fill="none" stroke="#ffffff" stroke-width="10"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`.trim();

// --- apple-touch-icon.png ------------------------------------------------
const touchPng = new Resvg(svg, { fitTo: { mode: 'width', value: 180 } })
  .render()
  .asPng();
writeFileSync(TOUCH_PATH, touchPng);
console.log(`Wrote ${TOUCH_PATH} (${touchPng.length} bytes)`);

// --- favicon.ico -----------------------------------------------------------
// resvg emits PNGs, so we wrap same artwork at 16/32/48px into a valid ICO
// container (PNG-in-ICO entries — supported by all modern browsers and,
// importantly, by Google's favicon crawler, which still requests /favicon.ico).
const sizes = [16, 32, 48];
const pngs = sizes.map((size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(pngs.length, 4); // image count

const directory = [];
let imageOffset = header.length + 16 * pngs.length;
pngs.forEach((png, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0); // width (256 would be encoded as 0)
  entry.writeUInt8(sizes[i], 1); // height
  entry.writeUInt8(0, 2); // palette color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // image byte length
  entry.writeUInt32LE(imageOffset, 12); // image byte offset
  directory.push(entry);
  imageOffset += png.length;
});

const ico = Buffer.concat([header, ...directory, ...pngs]);
writeFileSync(ICO_PATH, ico);
console.log(`Wrote ${ICO_PATH} (${ico.length} bytes, sizes ${sizes.join('/')})`);
