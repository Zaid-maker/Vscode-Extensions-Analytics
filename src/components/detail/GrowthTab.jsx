// TAB 2: GROWTH & MILESTONES — milestone tracker, projection chart and
// projected-points table.
import React, { lazy, Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import {
  formatNumber,
  formatFullNumber,
  formatDate,
} from '../../utils/formatters';
import ChartLoader from './ChartLoader';
import LazyErrorBoundary from '../LazyErrorBoundary';

const GrowthProjectionChart = lazy(() => import('../Charts/GrowthProjectionChart'));

export default function GrowthTab({ extension, milestones, projections }) {
  return (
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
        <LazyErrorBoundary compact>
          <Suspense fallback={<ChartLoader />}>
            <GrowthProjectionChart projections={projections} />
          </Suspense>
        </LazyErrorBoundary>
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
  );
}
