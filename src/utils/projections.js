// Growth projection models and release cadence analysis

/**
 * Calculate milestones and estimated time to reach next milestone
 */
export function calculateMilestones(currentInstalls, trendingWeekly) {
  if (!currentInstalls || currentInstalls <= 0) return null;

  // Milestone tiers
  const tiers = [
    10_000, 50_000, 100_000, 250_000, 500_000,
    1_000_000, 2_500_000, 5_000_000, 10_000_000,
    25_000_000, 50_000_000, 75_000_000, 100_000_000,
    150_000_000, 200_000_000, 250_000_000, 500_000_000
  ];

  const nextTier = tiers.find((t) => t > currentInstalls);
  if (!nextTier) return null;

  const needed = nextTier - currentInstalls;
  const progressPct = Math.min(
    100,
    Math.max(0, ((currentInstalls - (tiers[tiers.indexOf(nextTier) - 1] || 0)) /
      (nextTier - (tiers[tiers.indexOf(nextTier) - 1] || 0))) * 100)
  );

  // Weekly growth rate estimation (using trendingWeekly or fallback baseline of 0.3% weekly)
  const weeklyRate = Math.max(0.0005, trendingWeekly || 0.003);
  const estimatedWeeklyInstalls = Math.max(50, Math.round(currentInstalls * weeklyRate));
  const estimatedDailyInstalls = Math.round(estimatedWeeklyInstalls / 7);

  const daysToMilestone = Math.max(1, Math.round(needed / estimatedDailyInstalls));

  return {
    nextMilestone: nextTier,
    neededInstalls: needed,
    progressPercentage: Number(progressPct.toFixed(1)),
    estimatedDailyInstalls,
    estimatedWeeklyInstalls,
    daysToMilestone,
    estimatedDate: new Date(Date.now() + daysToMilestone * 24 * 60 * 60 * 1000),
  };
}

/**
 * Generate projection series for 30, 90, 180, and 365 days
 */
export function generateGrowthProjections(currentInstalls, trendingWeekly) {
  if (!currentInstalls || currentInstalls <= 0) return [];

  const weeklyRate = Math.max(0.0005, trendingWeekly || 0.003);
  const dailyRate = Math.pow(1 + weeklyRate, 1 / 7) - 1;

  const points = [
    { label: 'Current', days: 0 },
    { label: '+30 Days', days: 30 },
    { label: '+60 Days', days: 60 },
    { label: '+90 Days', days: 90 },
    { label: '+180 Days', days: 180 },
    { label: '+365 Days (1 Yr)', days: 365 },
  ];

  return points.map((p) => {
    // Compound growth estimate
    const projected = Math.round(currentInstalls * Math.pow(1 + dailyRate, p.days));
    const added = projected - currentInstalls;
    return {
      label: p.label,
      days: p.days,
      installs: projected,
      gain: added,
    };
  });
}

/**
 * Calculate version cadence and release interval stats
 */
export function analyzeReleaseCadence(versions) {
  if (!versions || versions.length < 2) {
    return {
      totalVersions: versions?.length || 1,
      avgDaysBetweenReleases: 0,
      releasesPerQuarter: 1,
      releaseHistoryByYear: {},
    };
  }

  // Sort versions by date ascending
  const sorted = [...versions]
    .filter((v) => v.lastUpdated)
    .sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));

  if (sorted.length < 2) {
    return {
      totalVersions: versions.length,
      avgDaysBetweenReleases: 0,
      releasesPerQuarter: 1,
      releaseHistoryByYear: {},
    };
  }

  const intervals = [];
  const byYear = {};

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].lastUpdated).getTime();
    const curr = new Date(sorted[i].lastUpdated).getTime();
    const diffDays = Math.max(0, Math.round((curr - prev) / (1000 * 60 * 60 * 24)));
    intervals.push(diffDays);

    const year = new Date(sorted[i].lastUpdated).getFullYear();
    byYear[year] = (byYear[year] || 0) + 1;
  }

  const avgDays = Math.round(
    intervals.reduce((acc, curr) => acc + curr, 0) / intervals.length
  );

  const releasesPerQuarter = Math.max(1, Math.round(90 / Math.max(1, avgDays)));

  return {
    totalVersions: versions.length,
    avgDaysBetweenReleases: avgDays,
    releasesPerQuarter,
    releaseHistoryByYear: byYear,
  };
}
