// Shareable per-extension routes: /extension/<publisher>.<name>
// e.g. /extension/GitHub.copilot
//
// These pages are prerendered at build time (scripts/prerender-extension-pages.mjs)
// for the curated set, and resolved client-side via the marketplace API for any
// other extension deep-linked after deploy.

export const SITE_URL = 'https://vscode-extensions-analytics.vercel.app';
export const EXTENSION_PATH_PREFIX = '/extension/';

export function extensionPath(extensionId) {
  return `${EXTENSION_PATH_PREFIX}${encodeURIComponent(extensionId)}`;
}

export function extensionUrl(extensionId) {
  return `${SITE_URL}${extensionPath(extensionId)}`;
}

/**
 * Extract the raw extension id (e.g. 'GitHub.copilot') from a pathname.
 * Returns null for anything that isn't a well-formed extension route,
 * so the SPA can treat every other path as the homepage.
 */
export function extensionIdFromPath(pathname = '') {
  if (!pathname.startsWith(EXTENSION_PATH_PREFIX)) return null;
  let raw;
  try {
    raw = decodeURIComponent(pathname.slice(EXTENSION_PATH_PREFIX.length));
  } catch {
    return null;
  }
  if (!raw || raw.includes('/')) return null;
  // Marketplace identifiers look like 'publisher.name' with URL-safe chars
  return /^[A-Za-z0-9][A-Za-z0-9._-]*\.[A-Za-z0-9][A-Za-z0-9._-]*$/.test(raw) ? raw : null;
}
