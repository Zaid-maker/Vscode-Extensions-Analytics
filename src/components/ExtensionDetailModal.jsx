import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  X,
  Download,
  Star,
  Flame,
  Calendar,
  Layers,
  ExternalLink,
  Copy,
  Check,
  BadgeCheck,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Swords,
  Box,
  Code,
  Shield,
  Clock,
  Sparkles,
  Building,
  Loader2,
} from 'lucide-react';
import {
  formatNumber,
  formatFullNumber,
  formatRelativeDate,
  formatDate,
  formatTrendPercent,
} from '../utils/formatters';
import {
  calculateMilestones,
  generateGrowthProjections,
  analyzeReleaseCadence,
} from '../utils/projections';
import { generateBadges, generateCliCommand } from '../utils/badges';
// Charts are code-split so recharts only loads when the detail modal opens
const DistributionChart = lazy(() => import('./Charts/DistributionChart'));
const VelocityChart = lazy(() => import('./Charts/VelocityChart'));
const ReleaseTimelineChart = lazy(() => import('./Charts/ReleaseTimelineChart'));
const GrowthProjectionChart = lazy(() => import('./Charts/GrowthProjectionChart'));

// In-panel chart placeholder while the recharts chunk streams in
function ChartLoader() {
  return (
    <div className="w-full h-56 flex items-center justify-center rounded-lg bg-slate-950/40 border border-slate-800/60">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );
}
import { getExtensionDetails } from '../services/marketplaceApi';

export default function ExtensionDetailModal({
  extension: initialExtension,
  onClose,
  onCompareToggle,
  isCompared,
  isWatchlisted,
  onWatchlistToggle,
  onSelectPublisher,
}) {
  const [detailedExtension, setDetailedExtension] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'growth' | 'releases' | 'badges'
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(null);

  // Fetch full details (with all versions and metadata flags)
  useEffect(() => {
    let isMounted = true;
    async function loadFullDetails() {
      if (!initialExtension?.id) return;
      try {
        setLoadingDetails(true);
        const detailed = await getExtensionDetails(initialExtension.id);
        if (isMounted && detailed) {
          setDetailedExtension(detailed);
        }
      } catch (err) {
        console.warn('Failed to load full extension details:', err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    }
    loadFullDetails();
    return () => {
      isMounted = false;
    };
  }, [initialExtension?.id]);

  // Derived extension object that prioritizes non-zero stats
  const extension = detailedExtension?.id === initialExtension?.id
    ? {
        ...initialExtension,
        ...detailedExtension,
        stats:
          detailedExtension.stats &&
          (detailedExtension.stats.installs > 0 || detailedExtension.stats.rating > 0)
            ? detailedExtension.stats
            : initialExtension.stats,
      }
    : initialExtension;

  if (!extension) return null;

  // Growth & Cadence calculations
  const milestones = calculateMilestones(
    extension.stats.installs,
    extension.stats.trendingWeekly
  );
  const projections = generateGrowthProjections(
    extension.stats.installs,
    extension.stats.trendingWeekly
  );
  const cadence = analyzeReleaseCadence(extension.versions);
  const badges = generateBadges(extension);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(generateCliCommand(extension.id));
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyBadge = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBadge(idx);
    setTimeout(() => setCopiedBadge(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Banner */}
        <div
          className="relative px-6 py-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900"
          style={{
            borderTop: `3px solid ${extension.branding?.color || '#6366f1'}`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-10">
            {/* Extension Icon */}
            <div className="w-16 h-16 rounded-2xl bg-slate-800 p-2.5 flex items-center justify-center shrink-0 border border-slate-700 shadow-xl">
              {extension.icon ? (
                <img
                  src={extension.icon}
                  alt={extension.displayName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Box className="w-9 h-9 text-indigo-400" />
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {extension.displayName}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <span>v{extension.latestVersion}</span>
                  {loadingDetails && <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-400" />}
                </span>
                {extension.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <button
                  onClick={() => {
                    onClose();
                    onSelectPublisher(extension.publisher.name);
                  }}
                  className="flex items-center gap-1.5 font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{extension.publisher.displayName}</span>
                  {extension.publisher.isVerified && (
                    <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </button>
                <span>•</span>
                <span className="font-mono text-slate-500">{extension.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Updated {formatRelativeDate(extension.lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            {/* Terminal install command */}
            <button
              onClick={handleCopyCmd}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:border-slate-700 font-mono transition-all"
            >
              {copiedCmd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-sans">Command Copied!</span>
                </>
              ) : (
                <>
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>code --install-extension {extension.id}</span>
                  <Copy className="w-3 h-3 text-slate-500 ml-1" />
                </>
              )}
            </button>

            {/* Compare Toggle */}
            <button
              onClick={() => onCompareToggle(extension)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
                isCompared
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare' : 'Add to Compare'}</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={() => onWatchlistToggle(extension)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
                isWatchlisted
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isWatchlisted ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Watchlisted</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Watchlist</span>
                </>
              )}
            </button>

            {/* External Links */}
            <div className="flex items-center gap-1 ml-auto">
              {extension.links.repository && (
                <a
                  href={extension.links.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  title="Source Repository"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              )}
              <a
                href={extension.links.marketplace}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all"
              >
                <span>Marketplace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Analytics Overview', icon: Layers },
            { id: 'growth', label: 'Growth & Milestones', icon: TrendingUp },
            { id: 'releases', label: 'Release Cadence', icon: Calendar },
            { id: 'badges', label: 'README Badges', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Core Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Active Installs</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {formatNumber(extension.stats.installs)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatFullNumber(extension.stats.installs)}
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Updates Delivered</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {formatNumber(extension.stats.updates)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    User updates distributed
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>User Rating</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
                    {extension.stats.rating > 0 ? extension.stats.rating : 'N/A'}
                    <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatNumber(extension.stats.ratingCount)} ratings
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Flame className="w-3.5 h-3.5 text-indigo-400" />
                    <span>7-Day Velocity</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {formatTrendPercent(extension.stats.trendingWeekly)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatTrendPercent(extension.stats.trendingMonthly)} (30d)
                  </div>
                </div>
              </div>

              {/* Two Visual Charts: Distribution Donut + Velocity Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Distribution Chart */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Installation & Activity Flow
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Breakdown of unique installs vs lifetime update packages delivered.
                  </p>
                  <Suspense fallback={<ChartLoader />}>
                    <DistributionChart stats={extension.stats} />
                  </Suspense>
                </div>

                {/* Velocity Momentum Chart */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Marketplace Trending Momentum
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Daily, weekly, and monthly growth velocity indices.
                  </p>
                  <Suspense fallback={<ChartLoader />}>
                    <VelocityChart stats={extension.stats} />
                  </Suspense>
                </div>
              </div>

              {/* Extension Description & Tags */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  About Extension
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {extension.description}
                </p>
                {extension.tags && extension.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {extension.tags.slice(0, 12).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GROWTH & MILESTONES */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              {/* Milestone Tracker Card */}
              {milestones && (
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h4 className="text-base font-bold text-white">
                          Next Milestone: {formatNumber(milestones.nextMilestone)} Installs
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Currently at {formatFullNumber(extension.stats.installs)} installs (
                        {formatNumber(milestones.neededInstalls)} remaining)
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-xl font-bold font-mono text-indigo-400">
                        ~{milestones.daysToMilestone} Days
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Est. Date: {formatDate(milestones.estimatedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/80">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${milestones.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Progress: {milestones.progressPercentage}%</span>
                    <span>
                      Est. Run-rate: ~{formatNumber(milestones.estimatedDailyInstalls)}/day
                    </span>
                  </div>
                </div>
              )}

              {/* Growth Projection Chart */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Projected Install Trajectory
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Based on current 7-day velocity model
                  </span>
                </div>
                <Suspense fallback={<ChartLoader />}>
                  <GrowthProjectionChart projections={projections} />
                </Suspense>
              </div>

              {/* Projected Points Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                {projections.map((p) => (
                  <div
                    key={p.label}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <span className="text-slate-400 text-[11px] block">{p.label}</span>
                    <span className="text-white font-mono font-bold mt-1 block">
                      {formatNumber(p.installs)}
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px] mt-0.5 block">
                      +{formatNumber(p.gain)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RELEASE CADENCE */}
          {activeTab === 'releases' && (
            <div className="space-y-6">
              {/* Cadence KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs mb-1">Tracked Releases</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {cadence.totalVersions} Versions
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Published lifecycle
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs mb-1">Average Cadence</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    ~{cadence.avgDaysBetweenReleases} Days
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Between consecutive updates
                  </div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs mb-1">Releases / Quarter</div>
                  <div className="text-xl font-bold font-mono text-indigo-400">
                    ~{cadence.releasesPerQuarter} Releases
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Quarterly maintenance pace
                  </div>
                </div>
              </div>

              {/* Release Timeline Chart */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Versions Released Over Time (By Year)
                </h4>
                <Suspense fallback={<ChartLoader />}>
                  <ReleaseTimelineChart cadenceData={cadence} />
                </Suspense>
              </div>

              {/* Version History Table */}
              <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    Recent Version Records
                  </span>
                  <span className="text-slate-500">
                    Showing latest {Math.min(10, extension.versions?.length || 0)} versions
                  </span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto text-xs">
                  {(extension.versions || []).slice(0, 10).map((v) => (
                    <div
                      key={v.version}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          v{v.version}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {v.targetPlatform}
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {formatDate(v.lastUpdated)} ({formatRelativeDate(v.lastUpdated)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BADGES & EMBEDS */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Generate real-time Shields.io badges for this extension to embed in your GitHub
                repository <code className="text-indigo-300 font-mono">README.md</code>.
              </p>

              <div className="space-y-3">
                {badges.map((b, idx) => (
                  <div
                    key={b.label}
                    className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {b.label}
                      </span>
                      {/* Live Badge Preview */}
                      <img src={b.badgeUrl} alt={b.label} className="h-6" />
                    </div>

                    {/* Markdown snippet */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 truncate">
                        {b.markdown}
                      </div>
                      <button
                        onClick={() => handleCopyBadge(b.markdown, idx)}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
                      >
                        {copiedBadge === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Markdown</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
