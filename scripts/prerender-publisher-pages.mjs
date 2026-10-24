// Prerenders static /publisher/<name> portfolio pages into
// dist/publisher/<name>/index.html for the TOP_PUBLISHERS quick-link set —
// the same publishers the in-app Publisher Intelligence panel promotes.
//
// Each page is honest, data-driven content: a KPI row (catalog installs,
// extension count, average portfolio rating) and a ranked table of the
// publisher's extensions linking to their /extension/<id> pages (prerendered
// for the curated set; any other id still resolves client-side via the SPA).
// Maintenance staleness badges use the same util as the app UI so the static
// pages and the interactive app never disagree.
//
// SEO per page: title/description/canonical/OG/Twitter + ItemList JSON-LD.
// The script also maintains the /publisher/ section of public/sitemap.xml
// (kept last in the build chain so it never clobbers the other sections).
//
// Resilience: if every marketplace fetch fails, existing sitemap entries are
// kept and no prerendered dirs are wiped (same policy as the other
// prerenderers). Pages not regenerated still resolve via the SPA route.
//
// Usage: node scripts/prerender-publisher-pages.mjs   (part of npm run build)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TOP_PUBLISHERS } from '../src/data/presets.js';
import { getPublisherExtensions } from '../src/services/marketplaceApi.js';
import { publisherUrl } from '../src/lib/routes.js';
import { maintenanceStatus, maintenanceMeta } from '../src/utils/maintenance.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = join(ROOT, 'dist', 'index.html');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const DIST_SITEMAP = join(ROOT, 'dist', 'sitemap.xml');

const PUB_HIDDEN_OPEN = '<div id="prerender-publisher" style="display:none">';
const PUB_VISIBLE_OPEN = '<div id="prerender-publisher">';

const REQUEST_DELAY_MS = 700;
const MAX_ATTEMPTS = 3;

async function fetchPublisher(portName, attempt = 1) {
  try {
    return await getPublisherExtensions(portName, 50);
  } catch (err) {
    // 429/403-style throttling between successive marketplace queries —
    // same backoff policy the extension prerenderer uses.
    if (attempt < MAX_ATTEMPTS && /429|413|50[0-3]|throttl|timeout|network/i.test(err.message)) {
      const wait = 2 * attempt;
      console.warn(`  ↻ /publisher/${portName}: ${err.message}, retrying in ${wait}s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      return fetchPublisher(portName, attempt + 1);
    }
    throw err;
  }
}

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

function formatInstalls(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function renderPublisherBody(pub, extensions) {
  const totalInstalls = extensions.reduce((acc, e) => acc + (e.stats?.installs || 0), 0);
  const rated = extensions.filter((e) => (e.stats?.ratingCount || 0) > 0);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((acc, e) => acc + e.stats.rating, 0) / rated.length).toFixed(2)
      : 'N/A';

  const rows = extensions
    .map((ext, i) => {
      const meta = maintenanceMeta(maintenanceStatus(ext.lastUpdated));
      const badge = meta
        ? `<span title="${escapeHtml(meta.hint)}"><span style="color:${meta.color}">●</span> ${escapeHtml(meta.shortLabel)}</span>`
        : '';
      return `          <tr>
            <td>${i + 1}. <a href="/extension/${escapeHtml(ext.id)}">${escapeHtml(ext.displayName)}</a> ${badge}</td>
            <td>${escapeHtml(truncate(ext.description || '', 90))}</td>
            <td>${formatInstalls(ext.stats?.installs || 0)}</td>
            <td>${ext.stats?.rating || '-'}</td>
            <td>${escapeHtml(ext.latestVersion || '')}</td>
          </tr>`;
    })
    .join('\n');

  return `<main>
        <h1>${escapeHtml(pub.label)} (${escapeHtml(pub.name)}) — VS Code Marketplace publisher analytics</h1>
        <p class="meta">Visual Studio Code extensions published by ${escapeHtml(pub.label)}, ranked by real install counts and pulled live from the Marketplace API at build time.</p>
        <ul class="kpis">
          <li>${extensions.length} extensions published</li>
          <li>${formatInstalls(totalInstalls)} total installs</li>
          <li>${avgRating} average rating</li>
        </ul>
        <h2>Extensions by ${escapeHtml(pub.label)} (${extensions.length})</h2>
        <table>
          <thead>
            <tr><th>Extension</th><th>Description</th><th>Installs</th><th>Rating</th><th>Version</th></tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
        <p class="cta"><a href="/">Compare ${escapeHtml(pub.label)}'s catalog live in ExtensionPulse →</a></p>
      </main>`;
}

function renderPage(pub, extensions, template) {
  const url = publisherUrl(pub.name);
  const title = `${pub.label} VS Code Extensions — Publisher Analytics | ExtensionPulse`;
  const year = new Date().getFullYear();
  const description = truncate(
    `All ${extensions.length} VS Code extensions by ${pub.label} (${pub.name}): live install counts, ratings and maintenance status, ranked from the Marketplace — ${year}.`,
    158
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `VS Code extensions by ${pub.label}`,
    url,
    numberOfItems: extensions.length,
    itemListElement: extensions.slice(0, 25).map((ext, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://vscode-extensions-analytics.vercel.app/extension/${ext.id}`,
      name: ext.displayName,
    })),
  };

  return template
    .replace(PUB_HIDDEN_OPEN, PUB_VISIBLE_OPEN)
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
    .replace(/(PRERENDER:pub-body -->)[\s\S]*?(<!-- \/PRERENDER:pub-body)/, `$1${renderPublisherBody(pub, extensions).replace(/[$]/g, '$$$$')}$2`);
}

function updateSitemap(entries) {
  let xml = readFileSync(SITEMAP, 'utf8');
  if (entries.length === 0) {
    console.warn('⚠ No publisher pages prerendered — leaving existing /publisher/ sitemap entries untouched.');
    return;
  }
  // This script owns only the /publisher/ section; the other scripts keep
  // their own sections (build order: extension → collection → publisher).
  xml = xml.replace(/\s*<!-- Publisher pages \(generated[^>]*-->[\s\S]*?(?=<\/urlset>)/g, '');
  xml = xml.replace(/\n  <url>\s*<loc>[^<]*\/publisher\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

  const block = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join('\n');
  xml = xml.replace('</urlset>', `\n  <!-- Publisher pages (generated by scripts/prerender-publisher-pages.mjs) -->\n${block}\n</urlset>`);

  writeFileSync(SITEMAP, xml);
  if (existsSync(DIST_SITEMAP)) {
    writeFileSync(DIST_SITEMAP, xml);
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

  const entries = [];
  let ok = 0;

  for (const pub of TOP_PUBLISHERS) {
    try {
      const extensions = await fetchPublisher(pub.name);
      if (!extensions.length) throw new Error('no extensions returned');

      const dir = join(ROOT, 'dist', 'publisher', pub.name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), renderPage(pub, extensions, template));

      entries.push({
        loc: publisherUrl(pub.name),
        lastmod: new Date().toISOString().slice(0, 10),
      });
      ok += 1;
      console.log(`✓ /publisher/${pub.name} — ${extensions.length} extensions`);
    } catch (err) {
      console.warn(`✗ /publisher/${pub.name}: ${err.message} (SPA route still resolves)`);
    }
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
  }

  updateSitemap(entries);
  console.log(`\nPrerendered ${ok}/${TOP_PUBLISHERS.length} publisher pages; sitemap has ${entries.length} /publisher/ URLs.`);
  if (ok === 0 && TOP_PUBLISHERS.length > 0) {
    console.error('⚠ All publisher fetches failed — /publisher/ pages were not regenerated.');
  }
}

main().catch((err) => {
  console.error('Publisher prerender failed:', err);
  process.exit(1);
});
