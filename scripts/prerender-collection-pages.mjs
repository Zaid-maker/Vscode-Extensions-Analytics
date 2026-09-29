// Prerenders static /best/<slug> collection pages ("best of" listicles) into
// dist/best/<slug>/index.html.
//
// Each page is honest, data-driven content: the ranked list IS the live
// marketplace result for the collection's query (category + sort), fetched at
// build time with the app's own searchExtensions() so prerendered data matches
// what a user sees in the app. Every list item links to the extension's
// /extension/<id> page (crawlable <a> in the static HTML), turning these
// pages into a dense internal-linking layer for the extension pages.
//
// SEO per page: title/description/canonical/OG/Twitter + ItemList JSON-LD.
// The script also maintains the /best/ section of public/sitemap.xml.
//
// Resilience: if every marketplace fetch fails, existing /best/ sitemap
// entries are kept and prerendered dirs remain untouched (same policy as the
// extension prerenderer). Pages not regenerated still resolve via the SPA.
//
// Usage: node scripts/prerender-collection-pages.mjs   (part of npm run build)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { COLLECTIONS } from '../src/data/collections.js';
import { searchExtensions } from '../src/services/marketplaceApi.js';
import { SITE_URL, extensionPath, extensionUrl } from '../src/lib/routes.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = join(ROOT, 'dist', 'index.html');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const DIST_SITEMAP = join(ROOT, 'dist', 'sitemap.xml');

const PAGE_SLICE_START = '<!-- PRERENDER:list-body -->';
const PAGE_SLICE_END = '<!-- /PRERENDER:list-body -->';

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncate(str = '', max) {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1).trimEnd()}…`;
}

function formatInstalls(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function metaTag(attrs, content) {
  return `<meta ${attrs}="${escapeHtml(content)}" />`;
}

// --- static HTML rendering -------------------------------------------------

function listItem(ext, rank) {
  const stats = [
    `${formatInstalls(ext.stats.installs)} installs`,
    ext.stats.ratingCount > 0
      ? `${ext.stats.rating} ★ (${ext.stats.ratingCount} ratings)`
      : null,
    `by ${ext.publisher.displayName}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return `        <li>
          <a href="${extensionPath(ext.id)}">
            <span class="rank">${rank}</span>
            <span class="name">${escapeHtml(ext.displayName)}</span>
            <span class="stats">${escapeHtml(stats)}</span>
            <span class="desc">${escapeHtml(truncate(ext.description || '', 140))}</span>
          </a>
        </li>`;
}

function renderListBody(collection, extensions) {
  const items = extensions.map((ext, i) => listItem(ext, i + 1)).join('\n');
  return `${PAGE_SLICE_START}
      <h1>${escapeHtml(collection.heading)}</h1>
      <p class="intro">${escapeHtml(collection.intro)}</p>
      <p class="updated">Ranked live from the VS Code Marketplace at build time.</p>
      <ol class="ranking">
${items}
      </ol>
      <p><a href="/">Analyze any of these live in ExtensionPulse →</a></p>
      ${PAGE_SLICE_END}`;
}

function renderPage(collection, extensions, template) {
  const url = `${SITE_URL}/best/${collection.slug}`;
  const title = `${collection.heading} | ExtensionPulse`;
  const description = truncate(collection.intro, 160);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.heading,
    description: collection.intro,
    url,
    numberOfItems: extensions.length,
    itemListElement: extensions.map((ext, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: extensionUrl(ext.id),
      name: ext.displayName,
    })),
  };

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      metaTag('name="description" content', description)
    )
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      metaTag('property="og:title" content', title)
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      metaTag('property="og:description" content', description)
    )
    .replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      metaTag('property="og:url" content', url)
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      metaTag('name="twitter:title" content', title)
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      metaTag('name="twitter:description" content', description)
    )
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?"@type": "WebApplication"[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n    ${JSON.stringify(jsonLd, null, 2).replace(/\n/g, '\n    ')}\n    </script>`
    )
    .replace(
      new RegExp(`${PAGE_SLICE_START}[\\s\\S]*${PAGE_SLICE_END}`),
      renderListBody(collection, extensions).replace(/\$/g, '$$$$')
    );
}

// --- sitemap maintenance ----------------------------------------------------

function updateSitemap(entries) {
  let xml = readFileSync(SITEMAP, 'utf8');
  if (entries.length === 0) {
    console.warn('⚠ No collection pages prerendered — leaving existing /best/ sitemap entries untouched.');
    return;
  }
  xml = xml.replace(/\s*<!-- Collection pages \(generated[^>]*-->[\s\S]*?(?=<\/urlset>)/g, '');
  xml = xml.replace(/\n  <url>\s*<loc>[^<]*\/best\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

  const block = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`
    )
    .join('\n');
  xml = xml.replace('</urlset>', `\n  <!-- Collection pages (generated by scripts/prerender-collection-pages.mjs) -->\n${block}\n</urlset>`);

  writeFileSync(SITEMAP, xml);
  if (existsSync(DIST_SITEMAP)) {
    writeFileSync(DIST_SITEMAP, xml);
  }
}

// --- main -------------------------------------------------------------------

async function main() {
  let template;
  try {
    template = readFileSync(TEMPLATE, 'utf8');
  } catch {
    console.error('✗ dist/index.html not found — run `vite build` before prerendering');
    process.exit(1);
  }

  if (!template.includes(PAGE_SLICE_START)) {
    console.error(`✗ dist/index.html is missing ${PAGE_SLICE_START} — add it to src/App.jsx before prerendering`);
    process.exit(1);
  }

  const entries = [];
  let ok = 0;

  for (const collection of COLLECTIONS) {
    try {
      const { extensions } = await searchExtensions({
        category: collection.category || 'All',
        ...(collection.searchText ? { searchText: collection.searchText } : {}),
        sortBy: collection.sortBy,
        pageSize: collection.pageSize,
        pageNumber: 1,
        force: true,
      });

      const dir = join(ROOT, 'dist', 'best', collection.slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), renderPage(collection, extensions, template));

      entries.push({
        loc: `${SITE_URL}/best/${collection.slug}`,
        lastmod: new Date().toISOString().slice(0, 10),
      });
      ok += 1;
      console.log(`✓ /best/${collection.slug} — ${extensions.length} items`);
    } catch (err) {
      console.warn(`✗ /best/${collection.slug}: ${err.message} (existing page kept; SPA still resolves the route)`);
    }
  }

  updateSitemap(entries);
  console.log(`\nPrerendered ${ok}/${COLLECTIONS.length} collection pages; sitemap has ${entries.length} /best/ URLs.`);
  if (ok === 0 && COLLECTIONS.length > 0) {
    console.error('⚠ All collection fetches failed — /best/ pages were not regenerated.');
  }
}

main().catch((err) => {
  console.error('Collection prerender failed:', err);
  process.exit(1);
});
