import React, { useState } from 'react';
import {
  Swords,
  Plus,
  Trash2,
  Trophy,
  Star,
  Flame,
  Sparkles,
  Box,
  BadgeCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  formatNumber,
  formatFullNumber,
  formatTrendPercent,
} from '../utils/formatters';
import { CURATED_COMPARISONS } from '../data/presets';
import { getExtensionDetails, getExtensionsBatch } from '../services/marketplaceApi';

const COMPARE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

export default function ComparisonArena({
  comparedExtensions,
  onRemoveFromCompare,
  onClearCompare,
  onAddExtensionById,
  onSelectExtension,
}) {
  const [customInput, setCustomInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle adding custom extension ID
  const handleAddCustom = async (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setErrorMsg('');
    setIsAdding(true);
    try {
      const ext = await getExtensionDetails(customInput.trim());
      if (ext) {
        onAddExtensionById(ext);
        setCustomInput('');
      } else {
        setErrorMsg('Extension not found. Please check the identifier.');
      }
    } catch (err) {
      console.warn('Failed to add custom extension:', err);
      setErrorMsg('Failed to fetch extension.');
    } finally {
      setIsAdding(false);
    }
  };

  // Pre-load curated comparison
  const loadCurated = async (preset) => {
    setIsAdding(true);
    setErrorMsg('');
    try {
      const exts = await getExtensionsBatch(preset.extensionIds);
      if (exts.length > 0) {
        onClearCompare();
        exts.forEach((ext) => onAddExtensionById(ext));
      }
    } catch (err) {
      console.warn('Failed to load curated battle:', err);
      setErrorMsg('Failed to load comparison preset.');
    } finally {
      setIsAdding(false);
    }
  };

  // Determine winners
  const mostInstallsId = [...comparedExtensions].sort(
    (a, b) => (b.stats?.installs || 0) - (a.stats?.installs || 0)
  )[0]?.id;

  const highestRatedId = [...comparedExtensions].sort(
    (a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0)
  )[0]?.id;

  const fastestTrendingId = [...comparedExtensions].sort(
    (a, b) => (b.stats?.trendingWeekly || 0) - (a.stats?.trendingWeekly || 0)
  )[0]?.id;

  // Chart data
  const chartData = comparedExtensions.map((ext, idx) => ({
    name: ext.displayName.length > 15 ? ext.displayName.slice(0, 15) + '...' : ext.displayName,
    fullName: ext.displayName,
    installs: ext.stats?.installs || 0,
    updates: ext.stats?.updates || 0,
    rating: ext.stats?.rating || 0,
    velocity: Number(((ext.stats?.trendingWeekly || 0) * 100).toFixed(2)),
    color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Presets */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Swords className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Extension Battle Arena
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Benchmark extensions side-by-side on downloads, trending velocity, and ratings.
            </p>
          </div>

          {/* Add custom extension input */}
          <form onSubmit={handleAddCustom} className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. charliermarsh.ruff"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={isAdding || !customInput.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-400 mb-3 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Curated Battle Presets */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Curated Matchups:
          </div>
          <div className="flex flex-wrap gap-2">
            {CURATED_COMPARISONS.map((preset) => (
              <button
                key={preset.title}
                onClick={() => loadCurated(preset)}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-all"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Grid or Empty State */}
      {comparedExtensions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
            <Swords className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Extensions in the Arena</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select one of the curated matchups above, or click the{' '}
            <Swords className="w-3.5 h-3.5 inline text-indigo-400" /> compare button on any
            extension card from the explorer tab.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action bar for compare list */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Comparing {comparedExtensions.length} of max 4 extensions
            </span>
            <button
              onClick={onClearCompare}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Arena</span>
            </button>
          </div>

          {/* Side by side cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(
              comparedExtensions.length,
              4
            )} gap-4`}
          >
            {comparedExtensions.map((ext, idx) => {
              const isDownloadsWinner = ext.id === mostInstallsId;
              const isRatingWinner = ext.id === highestRatedId;
              const isTrendingWinner = ext.id === fastestTrendingId;

              return (
                <div
                  key={ext.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    borderTop: `3px solid ${COMPARE_COLORS[idx % COMPARE_COLORS.length]}`,
                  }}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveFromCompare(ext.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
                    title="Remove from comparison"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-3 pr-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 p-2 flex items-center justify-center shrink-0 border border-slate-700">
                        {ext.icon ? (
                          <img
                            src={ext.icon}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Box className="w-6 h-6 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4
                          onClick={() => onSelectExtension(ext)}
                          className="font-bold text-sm sm:text-base text-white hover:text-indigo-400 cursor-pointer truncate transition-colors"
                        >
                          {ext.displayName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span className="truncate">{ext.publisher.displayName}</span>
                          {ext.publisher.isVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Winner Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {isDownloadsWinner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Most Downloaded
                        </span>
                      )}
                      {isRatingWinner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          Top Rated
                        </span>
                      )}
                      {isTrendingWinner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <Flame className="w-3 h-3 text-cyan-400" />
                          Fastest Trending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Metrics list */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Installs</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatNumber(ext.stats.installs)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Updates Delivered</span>
                      <span className="font-mono text-slate-300">
                        {formatNumber(ext.stats.updates)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Star Rating</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{ext.stats.rating}</span>
                        <span className="text-slate-500 text-[10px] font-normal">
                          ({formatNumber(ext.stats.ratingCount)})
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">7-Day Trend</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {formatTrendPercent(ext.stats.trendingWeekly)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">30-Day Trend</span>
                      <span className="font-mono text-cyan-400 font-semibold">
                        {formatTrendPercent(ext.stats.trendingMonthly)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => onSelectExtension(ext)}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        Deep Analytics
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-side Visual Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Installs Comparison Chart */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Installs Comparison
              </h4>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v) => formatNumber(v)}
                    />
                    <Tooltip
                      formatter={(v) => [formatFullNumber(v), 'Installs']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="installs" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trending Velocity Comparison Chart */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                7-Day Trending Velocity (%)
              </h4>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v) => [`${v}%`, 'Weekly Velocity']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="velocity" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
