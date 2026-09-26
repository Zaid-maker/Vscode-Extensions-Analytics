import React from 'react';
import {
  Download,
  Flame,
  Star,
  Trophy,
} from 'lucide-react';
import { formatNumber, formatTrendPercent } from '../utils/formatters';

export default function MetricCards({ extensions, _totalCount, isLoading }) {
  if (isLoading || !extensions || extensions.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="glass-panel p-4 rounded-xl border border-slate-800/80 animate-pulse h-24"
          >
            <div className="h-4 bg-slate-800 rounded w-1/3 mb-3"></div>
            <div className="h-6 bg-slate-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate aggregate metrics from the loaded batch
  const totalInstalls = extensions.reduce((acc, e) => acc + (e.stats.installs || 0), 0);
  const totalUpdates = extensions.reduce((acc, e) => acc + (e.stats.updates || 0), 0);

  // Top extension by installs
  const topExtension = [...extensions].sort(
    (a, b) => (b.stats.installs || 0) - (a.stats.installs || 0)
  )[0];

  // Top trending extension by weekly velocity
  const topTrending = [...extensions].sort(
    (a, b) => (b.stats.trendingWeekly || 0) - (a.stats.trendingWeekly || 0)
  )[0];

  // Average rating
  const validRatings = extensions.filter((e) => e.stats.rating > 0);
  const avgRating =
    validRatings.length > 0
      ? (
          validRatings.reduce((acc, e) => acc + e.stats.rating, 0) /
          validRatings.length
        ).toFixed(2)
      : '4.5';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Installs In View */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">
            Combined Installs
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Download className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatNumber(totalInstalls)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            across {extensions.length} items
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {formatNumber(totalUpdates)} updates distributed
        </p>
      </div>

      {/* Top Extension Leader */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">
            Downloads Leader
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="truncate">
          <span className="text-lg font-bold text-slate-100 truncate block">
            {topExtension?.displayName || 'Python'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-mono font-semibold text-amber-400">
            {formatNumber(topExtension?.stats?.installs || 0)}
          </span>
          <span className="text-[11px] text-slate-500">installs</span>
        </div>
      </div>

      {/* Top Trending */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">
            Trending Velocity
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="truncate">
          <span className="text-lg font-bold text-slate-100 truncate block">
            {topTrending?.displayName || 'Top Gainer'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-mono font-semibold text-cyan-400">
            {formatTrendPercent(topTrending?.stats?.trendingWeekly)}
          </span>
          <span className="text-[11px] text-slate-500">7-day velocity</span>
        </div>
      </div>

      {/* Average Rating */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">
            Avg User Rating
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Star className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
            {avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Based on user community reviews
        </p>
      </div>
    </div>
  );
}
