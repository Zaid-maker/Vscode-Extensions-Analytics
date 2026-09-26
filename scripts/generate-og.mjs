// One-off generator for public/og-image.png (1200x630 Open Graph card).
// Usage: node scripts/generate-og.mjs
// Requires: npm i --no-save @resvg/resvg-js
// Downloads Inter TTFs from Google Fonts on first run (cached in scripts/.og-fonts).

import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_DIR = join(__dirname, '.og-fonts');
const OUT_PATH = join(__dirname, '..', 'public', 'og-image.png');

const FONTS = [
  {
    file: 'Inter-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
  },
  {
    file: 'Inter-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf',
  },
  {
    file: 'Inter-ExtraBold.ttf',
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf',
  },
];

async function downloadFonts() {
  mkdirSync(FONT_DIR, { recursive: true });
  for (const font of FONTS) {
    const dest = join(FONT_DIR, font.file);
    if (existsSync(dest)) continue;
    process.stdout.write(`Downloading ${font.file}... `);
    const res = await fetch(font.url);
    if (!res.ok) throw new Error(`Failed to fetch ${font.url}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    console.log('ok');
  }
}

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow1" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.30"/>
      <stop offset="62%" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.24"/>
      <stop offset="62%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <radialGradient id="fadeMask" cx="0.5" cy="0.42" r="0.85">
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <mask id="gridMask">
      <rect width="1200" height="630" fill="url(#fadeMask)"/>
    </mask>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#94a3b8" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="#0b0f17"/>
  <circle cx="-100" cy="-100" r="700" fill="url(#glow1)"/>
  <circle cx="1250" cy="720" r="650" fill="url(#glow2)"/>
  <rect width="1200" height="630" fill="url(#grid)" mask="url(#gridMask)"/>

  <!-- domain -->
  <text x="1120" y="52" text-anchor="end" font-family="Inter" font-weight="500" font-size="20" fill="#475569">vscode-extensions-analytics.vercel.app</text>

  <!-- brand row -->
  <g transform="translate(80, 90)">
    <rect width="92" height="92" rx="24" fill="url(#logoGrad)"/>
    <g transform="translate(18, 18)" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12h4l3-8 4 16 3-8h6" transform="scale(2.33)"/>
    </g>
    <text x="130" y="76" font-family="Inter" font-weight="800" font-size="78" letter-spacing="-2" fill="#f1f5f9">Extension<tspan fill="url(#pulseGrad)">Pulse</tspan></text>
  </g>

  <!-- tagline -->
  <text x="80" y="322" font-family="Inter" font-weight="500" font-size="32" fill="#94a3b8">
    <tspan x="80" dy="0">Real-time <tspan fill="#e2e8f0" font-weight="600">VS Code Marketplace</tspan> analytics —</tspan>
    <tspan x="80" dy="46">download trends, growth velocity &amp; head-to-head</tspan>
    <tspan x="80" dy="46">extension comparisons.</tspan>
  </text>

  <!-- chips -->
  <g transform="translate(80, 522)">
    <rect width="300" height="66" rx="16" fill="#1e293b" fill-opacity="0.55" stroke="#6366f1" stroke-opacity="0.35"/>
    <circle cx="34" cy="33" r="7" fill="#818cf8"/>
    <text x="56" y="42" font-family="Inter" font-weight="600" font-size="24" fill="#cbd5e1">Live install stats</text>
  </g>
  <g transform="translate(404, 522)">
    <rect width="330" height="66" rx="16" fill="#1e293b" fill-opacity="0.55" stroke="#6366f1" stroke-opacity="0.35"/>
    <circle cx="34" cy="33" r="7" fill="#a78bfa"/>
    <text x="56" y="42" font-family="Inter" font-weight="600" font-size="24" fill="#cbd5e1">Trending velocity</text>
  </g>
  <g transform="translate(758, 522)">
    <rect width="250" height="66" rx="16" fill="#1e293b" fill-opacity="0.55" stroke="#6366f1" stroke-opacity="0.35"/>
    <circle cx="34" cy="33" r="7" fill="#38bdf8"/>
    <text x="56" y="42" font-family="Inter" font-weight="600" font-size="24" fill="#cbd5e1">Battle arena</text>
  </g>
</svg>
`.trim();

await downloadFonts();

const fontFiles = FONTS.map((f) => readFileSync(join(FONT_DIR, f.file)));

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: {
    fontFiles: fontFiles,
    loadSystemFonts: false,
    defaultFontFamily: 'Inter',
  },
});

const png = resvg.render().asPng();
writeFileSync(OUT_PATH, png);
console.log(`Wrote ${OUT_PATH} (${png.length} bytes)`);
