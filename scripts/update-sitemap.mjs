// Updates <lastmod> in public/sitemap.xml from git history so it never goes stale.
// Runs automatically before every build ("prebuild" in package.json).
//
// For each <url> in the sitemap, the date is the last commit that touched anything
// that can affect that page's content or metadata:
//   - "/" (the SPA homepage): src/, index.html, package-lock.json, and this script
//   - future static routes: add a mapping in ROUTES below
//
// Git date resolution order (first available wins):
//   1. GITHUB_COMMIT_DATE env var (set by the deploy platform on CI builds)
//   2. latest commit date among the route's tracked paths
//   3. latest commit date in the repo
//   4. today's date (fallback, e.g. no git history in the deploy checkout)
//
// W3C DATETIME format note: Google accepts YYYY-MM-DD or full timestamps; the
// plain date keeps diffs stable across timezones.
//
// Usage: node scripts/update-sitemap.mjs   (usually via `npm run build`)

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');

// Which paths drive each sitemap entry's lastmod. Everything must be covered —
// a route missing here silently keeps a stale date.
const ROUTES = [
  { loc: 'https://vscode-extensions-analytics.vercel.app/', paths: ['src', 'index.html', 'package-lock.json', 'scripts/update-sitemap.mjs'] },
];

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function latestCommitMs(paths) {
  // -n 1: only the most recent commit among these paths
  const out = git(['log', '-n', '1', '--format=%ct', '--', ...paths]);
  if (!out) return null;
  const secs = Number(out.split('\n').pop());
  return Number.isFinite(secs) ? secs * 1000 : null;
}

function envCommitMs() {
  const raw = process.env.GITHUB_COMMIT_DATE ?? process.env.VERCEL_GIT_COMMIT_DATE;
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : ms;
}

const envMs = envCommitMs();
const repoMs = (() => {
  const out = git(['log', '-n', '1', '--format=%ct']);
  const secs = out ? Number(out.split('\n').pop()) : NaN;
  return Number.isFinite(secs) ? secs * 1000 : null;
})();

let xml = readFileSync(SITEMAP, 'utf8');
let changed = 0;
let warnings = 0;

for (const route of ROUTES) {
  const locEscaped = route.loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const urlRe = new RegExp(`(<loc>${locEscaped}</loc>\\s*<lastmod>)([^<]+)(</lastmod>)`);
  if (!urlRe.test(xml)) {
    console.warn(`⚠ sitemap: no <url> entry with <loc>${route.loc}</loc> — lastmod not updated`);
    warnings += 1;
    continue;
  }

  const routeMs = latestCommitMs(route.paths);
  let dateMs;
  let source;
  if (envMs != null) {
    [dateMs, source] = [envMs, 'env (deploy platform)'];
  } else if (routeMs != null) {
    [dateMs, source] = [routeMs, 'git (route paths)'];
  } else if (repoMs != null) {
    [dateMs, source] = [repoMs, 'git (repo HEAD)'];
  } else {
    [dateMs, source] = [Date.now(), 'fallback (no git history)'];
  }

  const date = toIsoDate(dateMs);
  xml = xml.replace(urlRe, `$1${date}$3`);
  changed += 1;
  console.log(`✓ ${route.loc} → lastmod ${date} (${source})`);
}

writeFileSync(SITEMAP, xml);

if (changed === 0 && ROUTES.length > 0) {
  console.error('✗ sitemap: no entries were updated — check ROUTES against public/sitemap.xml');
  process.exit(1);
}
if (warnings > 0) process.exitCode = 1;
