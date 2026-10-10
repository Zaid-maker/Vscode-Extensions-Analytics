// TAB 1: ANALYTICS OVERVIEW — core metrics, distribution/velocity charts,
// description & tags, and the related-extensions panel.
import React, { lazy, Suspense } from 'react';
import {
  Download,
  Star,
  Flame,
  Layers,
  Sparkles,
  Box,
  Loader2,
} from 'lucide-react';
import {
  formatNumber,
  formatFullNumber,
  formatTrendPercent,
} from '../../utils/formatters';
import ChartLoader from './ChartLoader';
import LazyErrorBoundary from '../LazyErrorBoundary';

const DistributionChart = lazy(() => import('../Charts/DistributionChart'));
const VelocityChart = lazy(() => import('../Charts/VelocityChart'));

export default function OverviewTab({ extension, related, loadingRelated, onRelatedSelect }) {
  return (
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
          <LazyErrorBoundary compact>
            <Suspense fallback={<ChartLoader />}>
              <DistributionChart stats={extension.stats} />
            </Suspense>
          </LazyErrorBoundary>
        </div>

        {/* Velocity Momentum Chart */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Marketplace Trending Momentum
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">
            Daily, weekly, and monthly growth velocity indices.
          </p>
          <LazyErrorBoundary compact>
            <Suspense fallback={<ChartLoader />}>
              <VelocityChart stats={extension.stats} />
            </Suspense>
          </LazyErrorBoundary>
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

        {/* Related extensions: same category, ranked by installs */}
        <div className="pt-6 border-t border-slate-800/80">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Related in {extension.categories?.[0]}
          </h3>
          {loadingRelated ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              Loading related extensions…
            </div>
          ) : related.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {related.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onRelatedSelect?.(rel)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-indigo-500/60 hover:bg-slate-900 transition-all text-left group/rel"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-800 p-1.5 shrink-0">
                    {rel.icon ? (
                      <img src={rel.icon} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Box className="w-full h-full text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-200 truncate group-hover/rel:text-indigo-300 transition-colors">
                      {rel.displayName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {formatNumber(rel.stats?.installs)} installs
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No related extensions found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}
