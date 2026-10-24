import { describe, it, expect } from 'vitest';
import {
  monthsSince,
  maintenanceStatus,
  maintenanceMeta,
  MAINTENANCE_STATUS,
} from '../utils/maintenance';

const NOW = new Date('2026-10-25T12:00:00Z');

describe('monthsSince', () => {
  it('returns null for missing or invalid timestamps', () => {
    expect(monthsSince(undefined, NOW)).toBeNull();
    expect(monthsSince('', NOW)).toBeNull();
    expect(monthsSince('definitely-not-a-date', NOW)).toBeNull();
  });

  it('computes months of age from an ISO date', () => {
    expect(monthsSince('2026-09-25T12:00:00Z', NOW)).toBeCloseTo(1, 1);
  });

  it('clamps future timestamps to zero age', () => {
    expect(monthsSince('2027-01-01T00:00:00Z', NOW)).toBe(0);
  });
});

describe('maintenanceStatus', () => {
  it('returns null with no timestamp', () => {
    expect(maintenanceStatus(null, NOW)).toBeNull();
  });

  it('classifies fresh updates as active', () => {
    expect(maintenanceStatus('2026-09-01T00:00:00Z', NOW)).toBe(MAINTENANCE_STATUS.ACTIVE);
  });

  it('classifies 7 months without release as stale', () => {
    expect(maintenanceStatus('2026-03-01T00:00:00Z', NOW)).toBe(MAINTENANCE_STATUS.STALE);
  });

  it('classifies over 2 years without release as abandoned', () => {
    expect(maintenanceStatus('2024-01-01T00:00:00Z', NOW)).toBe(MAINTENANCE_STATUS.ABANDONED);
  });

  it('treats just-under 6 months as still active', () => {
    expect(maintenanceStatus('2026-05-05T00:00:00Z', NOW)).toBe(MAINTENANCE_STATUS.ACTIVE);
  });
});

describe('maintenanceMeta', () => {
  it('returns presentation info for every known status', () => {
    for (const status of Object.values(MAINTENANCE_STATUS)) {
      const meta = maintenanceMeta(status);
      expect(meta).toBeTypeOf('object');
      expect(meta.label).toBeTypeOf('string');
      expect(String(meta.color)).toMatch(/^#/);
    }
  });

  it('returns null for unknown status', () => {
    expect(maintenanceMeta('nonsense')).toBeNull();
  });
});
