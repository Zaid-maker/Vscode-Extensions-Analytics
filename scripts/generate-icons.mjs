// One-off generator for public/apple-touch-icon.png (180x180).
// Usage: npm i --no-save @resvg/resvg-js && node scripts/generate-icons.mjs
// Full-bleed square (no transparency): iOS applies its own rounded mask.

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'public', 'apple-touch-icon.png');

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

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 180 } });
const png = resvg.render().asPng();
writeFileSync(OUT_PATH, png);
console.log(`Wrote ${OUT_PATH} (${png.length} bytes)`);
