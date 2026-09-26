import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Star,
  Box,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  formatNumber,
  formatFullNumber,
} from '../utils/formatters';
import { TOP_PUBLISHERS } from '../data/presets';
import { getPublisherExtensions } from '../services/marketplaceApi';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function PublisherAnalytics({
  selectedPublisherName = 'GitHub',
  onSelectPublisher,
  onSelectExtension,
}) {
  const [query, setQuery] = useState(selectedPublisherName);
  const [currentPublisher, setCurrentPublisher] = useState(selectedPublisherName);
  const [extensions, setExtensions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPublisher = useCallback(
    async (name) => {
      if (!name) return;
      setIsLoading(true);
      setError(null);
      setCurrentPublisher(name);
      if (onSelectPublisher) {
        onSelectPublisher(name);
      }
      try {
        const exts = await getPublisherExtensions(name);
        setExtensions(exts);
      } catch (err) {
        console.warn('Failed to fetch publisher extensions:', err);
        setError('Failed to fetch extensions for this publisher.');
        setExtensions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSelectPublisher]
  );

  useEffect(() => {
    const pub = selectedPublisherName || 'GitHub';
    // oxlint-disable-next-line react/set-state-in-effect
    fetchPublisher(pub);
  }, [fetchPublisher, selectedPublisherName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchPublisher(query.trim());
    }
  };

  // Portfolio calculations
  const totalInstalls = extensions.reduce((acc, e) => acc + (e.stats.installs || 0), 0);
  const totalUpdates = extensions.reduce((acc, e) => acc + (e.stats.updates || 0), 0);
  const validRatings = extensions.filter((e) => e.stats.rating > 0);
  const avgRating =
    validRatings.length > 0
      ? (
          validRatings.reduce((acc, e) => acc + e.stats.rating, 0) /
          validRatings.length
        ).toFixed(2)
      : 'N/A';

  const sortedExtensions = [...extensions].sort(
    (a, b) => (b.stats.installs || 0) - (a.stats.installs || 0)
  );

  const topExtension = sortedExtensions[0];
  const topSharePct =
    totalInstalls > 0 && topExtension
      ? ((topExtension.stats.installs / totalInstalls) * 100).toFixed(1)
      : '0';

  // Portfolio pie data for top 5 extensions + Others
  const top5 = sortedExtensions.slice(0, 5);
  const othersTotal = sortedExtensions
    .slice(5)
    .reduce((acc, e) => acc + (e.stats.installs || 0), 0);

  const portfolioChartData = [
    ...top5.map((e) => ({
      name: e.displayName,
      value: e.stats.installs || 0,
    })),
    ...(othersTotal > 0 ? [{ name: 'Other Extensions', value: othersTotal }] : []),
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Publisher Search */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Publisher Intelligence
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Analyze marketplace market share, aggregate download volume, and catalog breadth.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Publisher name (e.g. Microsoft)"
                className="w-56 sm:w-64 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 shrink-0"
            >
              Analyze
            </button>
          </form>
        </div>

        {/* Top Publisher Quick Links */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Prominent Publishers:
          </div>
          <div className="flex flex-wrap gap-2">
            {TOP_PUBLISHERS.map((pub) => {
              const isCurrent =
                currentPublisher.toLowerCase() === pub.name.toLowerCase();
              return (
                <button
                  key={pub.name}
                  onClick={() => {
                    setQuery(pub.name);
                    fetchPublisher(pub.name);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <img
                    src={pub.icon}
                    alt=""
                    className="w-3.5 h-3.5 rounded-full"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <span>{pub.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center animate-pulse">
          <Building2 className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-bounce" />
          <p className="text-sm text-slate-400">Loading publisher catalog intelligence...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/20 text-center text-rose-400">
          {error}
        </div>
      ) : extensions.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center text-slate-400">
          No extensions found for publisher "{currentPublisher}". Try checking the exact publisher ID.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Publisher Summary KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Catalog Installs</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {formatNumber(totalInstalls)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {formatFullNumber(totalInstalls)}
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Portfolio Size</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
                {extensions.length} Extensions
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {formatNumber(totalUpdates)} updates shipped
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Average Portfolio Rating</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 flex items-baseline gap-1">
                {avgRating} <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Across rated extensions
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs mb-1">Flagship Dependency</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-400">
                {topSharePct}%
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5" title={topExtension?.displayName}>
                Top: {topExtension?.displayName}
              </div>
            </div>
          </div>

          {/* Portfolio Share Visual Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Donut Chart */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 md:col-span-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Portfolio Download Share
                </h4>
                <p className="text-[11px] text-slate-400 mb-2">
                  Distribution of installs across top extensions.
                </p>
              </div>

              <div className="w-full h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {portfolioChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#0b0f17"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [formatNumber(v), 'Installs']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px]">
                {portfolioChartData.slice(0, 4).map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-slate-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-white font-medium">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Publisher Extensions Catalog Table */}
            <div className="glass-panel rounded-xl border border-slate-800 md:col-span-2 overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  Published Extensions ({extensions.length})
                </span>
                <span className="text-slate-500">Sorted by downloads</span>
              </div>

              <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[380px]">
                {sortedExtensions.map((ext) => (
                  <div
                    key={ext.id}
                    onClick={() => onSelectExtension(ext)}
                    className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-700/60">
                        {ext.icon ? (
                          <img
                            src={ext.icon}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Box className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-100 truncate hover:text-indigo-400 transition-colors">
                          {ext.displayName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          v{ext.latestVersion} • {ext.categories?.[0] || 'Utility'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <div className="font-mono font-bold text-white text-xs sm:text-sm">
                          {formatNumber(ext.stats.installs)}
                        </div>
                        <div className="text-[10px] text-slate-500">installs</div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex items-center gap-1 font-mono text-amber-400 text-xs">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{ext.stats.rating > 0 ? ext.stats.rating : '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatNumber(ext.stats.ratingCount)} reviews
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
