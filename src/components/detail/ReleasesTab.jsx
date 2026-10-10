// TAB 3: RELEASE CADENCE — cadence KPIs, timeline chart and version history.
import React, { lazy, Suspense } from 'react';
import { formatDate, formatRelativeDate } from '../../utils/formatters';
import ChartLoader from './ChartLoader';
import LazyErrorBoundary from '../LazyErrorBoundary';

const ReleaseTimelineChart = lazy(() => import('../Charts/ReleaseTimelineChart'));

export default function ReleasesTab({ extension, cadence }) {
  return (
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
        <LazyErrorBoundary compact>
          <Suspense fallback={<ChartLoader />}>
            <ReleaseTimelineChart cadenceData={cadence} />
          </Suspense>
        </LazyErrorBoundary>
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
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
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
  );
}
