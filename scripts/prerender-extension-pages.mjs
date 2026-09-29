// Prerenders static per-extension pages into dist/extension/<id>/index.html so
// every curated extension is individually indexable with its own title,
// description, canonical URL, Open Graph tags and SoftwareApplication JSON-LD.
//
// Runs after `vite build` (see package.json): it clones dist/index.html — which
// already contains the app shell, hashed asset links and site-level JSON-LD —
// and swaps the head metadata for the extension's real marketplace data.
//
// The same script maintains the /extension/ entries in public/sitemap.xml using
// each extension's real last-updated date, then refreshes the copy in dist/.
//
// Pages NOT prerendered here still work: App.jsx resolves any /extension/:id
// client-side, so deep links stay functional for non-curated extensions.
//
// Usage: node scripts/prerender-extension-pages.mjs   (part of npm run build)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { POPULAR_SEARCH_TAGS } from '../src/data/presets.js';
import { normalizeExtension, FilterType, Flags } from '../src/services/marketplaceApi.js';
import { extensionUrl } from '../src/lib/routes.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = join(ROOT, 'dist', 'index.html');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const DIST_SITEMAP = join(ROOT, 'dist', 'sitemap.xml');
const API_ENDPOINT = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
const REQUEST_DELAY_MS = 400;
const DESC_MAX_CHARS = 160;

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

function metaTag(attrs, content) {
  return `<meta ${attrs}="${escapeHtml(content)}" />`;
}

async function fetchExtension(extensionId, attempt = 1) {
  const body = {
    filters: [
      {
        criteria: [{ filterType: FilterType.EXTENSION_NAME, value: extensionId }],
        pageNumber: 1,
        pageSize: 1,
        sortBy: 0,
        sortOrder: 0,
      },
    ],
    flags: Flags.DETAILED,
  };

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;api-version=3.0-preview.1',
      'User-Agent': 'extensionpulse-prerender/1.0',
    },
    body: JSON.stringify(body),
  });

  if ((res.status === 403 || res.status === 429) && attempt < 3) {
    const retryAfter = Number(res.headers.get('retry-after')) || 2 * attempt;
    console.warn(`  ↻ ${extensionId}: HTTP ${res.status}, retrying in ${retryAfter}s`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return fetchExtension(extensionId, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const raw = data?.results?.[0]?.extensions?.[0];
  if (!raw) throw new Error('not found on the marketplace');
  return normalizeExtension(raw);
}

function renderPage(ext, template) {
  const url = extensionUrl(ext.id);
  const title = `${ext.displayName} (${ext.id}) — VS Code Extension Analytics | ExtensionPulse`;
  const description = truncate(ext.description || '', DESC_MAX_CHARS);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: ext.displayName,
    softwareVersion: ext.latestVersion,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url,
    description: ext.description || '',
    datePublished: ext.publishedDate || undefined,
    dateModified: ext.lastUpdated || undefined,
    author: { '@type': 'Organization', name: ext.publisher.displayName },
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    ...(ext.stats.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: ext.stats.rating,
            ratingCount: ext.stats.ratingCount,
          },
        }
      : {}),
  };

  let html = template
    // <title> and core meta
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      metaTag('name="description" content', description)
    )
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    // Open Graph
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
    // Twitter
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      metaTag('name="twitter:title" content', title)
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      metaTag('name="twitter:description" content', description)
    )
    // The site-level WebApplication block describes ExtensionPulse itself —
    // wrong entity for an extension page. Replace it with the extension's.
    .replace(/<script type="application\/ld\+json">[\s\S]*?"@type": "WebApplication"[\s\S]*?<\/script>/, `<script type="application/ld+json">\n    ${JSON.stringify(jsonLd, null, 2).replace(/\n/g, '\n    ')}\n    </script>`);

  return html;
}

function updateSitemap(entries) {
  let xml = readFileSync(SITEMAP, 'utf8');
  if (entries.length === 0) {
    // Total fetch failure (marketplace outage) — keep the previous run's
    // /extension/ entries rather than shipping a sitemap that lost pages.
    console.warn('⚠ No pages prerendered — leaving existing /extension/ sitemap entries untouched.');
    return;
  }
  // Prerender script owns the /extension/ section; drop stale entries first
  // (\s* catches both newline-preceded and inline leftover comments)
  xml = xml.replace(/\s*<!-- Extension pages \(generated[^>]*-->[\s\S]*?(?=<\/urlset>)/g, '');
  xml = xml.replace(/\n  <url>\s*<loc>[^<]*\/extension\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

  if (entries.length > 0) {
    const block = entries
      .map(
        (e) =>
          `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      )
      .join('\n');
    xml = xml.replace('</urlset>', `\n  <!-- Extension pages (generated by scripts/prerender-extension-pages.mjs) -->\n${block}\n</urlset>`);
  }

  writeFileSync(SITEMAP, xml);
  if (existsSync(DIST_SITEMAP)) {
    writeFileSync(DIST_SITEMAP, xml); // vite copied the old one during build; refresh it
  }
}

async function main() {
  let template;
  try {
    template = readFileSync(TEMPLATE, 'utf8');
  } catch {
    console.error('✗ dist/index.html not found — run `vite build` before prerendering');
    process.exit(1);
  }

  const ids = POPULAR_SEARCH_TAGS.map((t) => t.query);
  console.log(`Prerendering ${ids.length} extension pages…`);

  const sitemapEntries = [];
  const seen = new Set();
  let ok = 0;
  let failed = 0;

  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    try {
      const ext = await fetchExtension(id);
      const dir = join(ROOT, 'dist', 'extension', ext.id);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), renderPage(ext, template));

      // Real freshness signal: the extension's own last-updated date
      const lastmod = (ext.lastUpdated || new Date().toISOString()).slice(0, 10);
      sitemapEntries.push({ loc: extensionUrl(ext.id), lastmod });
      ok += 1;
      console.log(`✓ ${ext.id} — "${ext.displayName}" (lastmod ${lastmod})`);
    } catch (err) {
      failed += 1;
      console.warn(`✗ ${id}: ${err.message} (page will still resolve client-side)`);
    }
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
  }

  updateSitemap(sitemapEntries);

  console.log(`\nPrerendered ${ok}/${ids.length} pages; sitemap has ${sitemapEntries.length} extension URLs.`);
  if (ok === 0 && failed > 0) {
    // Every fetch failed → likely a marketplace outage. Build stays green (the
    // SPA still handles these routes), but make the failure visible in CI logs.
    console.error('⚠ All prerender fetches failed — extension pages were not generated.');
  }
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
