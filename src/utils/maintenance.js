// Extension maintenance status, derived from marketplace metadata only:
// how long ago the extension's current (latest) version was last updated.
//
// Pure and dependency-free by design so it can be shared between the React
// UI (badges) and node build scripts (static prerendered SEO bodies).
//
// Honest framing: no releases in a while is evidence of staleness, not
// proof the extension is broken or abandoned — hence the hedged labels.

const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000;

export const MAINTENANCE_STATUS = {
  ACTIVE: 'active',
  STALE: 'stale',
  ABANDONED: 'abandoned',
};

const STALE_AFTER_MONTHS = 6;
const ABANDONED_AFTER_MONTHS = 24;

/** Age in months since the last update; NaN-safe. */
export function monthsSince(dateIso, now = new Date()) {
  const t = new Date(dateIso).getTime();
  if (!dateIso || Number.isNaN(t)) return null;
  return Math.max(0, (now.getTime() - t) / MONTH_MS);
}

/**
 * Classify an extension from its lastUpdated ISO timestamp.
 * Returns one of MAINTENANCE_STATUS, or null when no usable timestamp.
 */
export function maintenanceStatus(lastUpdated, now = new Date()) {
  const months = monthsSince(lastUpdated, now);
  if (months === null) return null;
  if (months <= STALE_AFTER_MONTHS) return MAINTENANCE_STATUS.ACTIVE;
  if (months <= ABANDONED_AFTER_MONTHS) return MAINTENANCE_STATUS.STALE;
  return MAINTENANCE_STATUS.ABANDONED;
}

/**
 * Presentation metadata per status. Color comes as a raw hex (not a
 * Tailwind class) so dynamically-built markup is safe from CSS purge.
 */
export function maintenanceMeta(status) {
  switch (status) {
    case MAINTENANCE_STATUS.ACTIVE:
      return {
        label: 'Actively updated',
        shortLabel: 'Active',
        hint: 'Last release within the past 6 months',
        color: '#34d399',
      };
    case MAINTENANCE_STATUS.STALE:
      return {
        label: 'Rarely updated',
        shortLabel: 'Stale',
        hint: 'No release in the past 6 months',
        color: '#fbbf24',
      };
    case MAINTENANCE_STATUS.ABANDONED:
      return {
        label: 'Likely abandoned',
        shortLabel: 'Abandoned',
        hint: 'No release in over 2 years',
        color: '#fb7185',
      };
    default:
      return null;
  }
}
