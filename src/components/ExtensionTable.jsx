import React, { useState } from 'react';
import {
  Star,
  Flame,
  Bookmark,
  BookmarkCheck,
  Swords,
  Copy,
  Check,
  BadgeCheck,
  Box,
} from 'lucide-react';
import {
  formatNumber,
  formatFullNumber,
  formatRelativeDate,
  formatTrendPercent,
} from '../utils/formatters';

export default function ExtensionTable({
  extensions,
  onSelect,
  onCompareToggle,
  comparedIds,
  watchlistedIds,
  onWatchlistToggle,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyCmd = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`code --install-extension ${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Extension</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Installs</th>
              <th className="py-3 px-4 text-right">Updates</th>
              <th className="py-3 px-4 text-center">Rating</th>
              <th className="py-3 px-4 text-right">7d Trend</th>
              <th className="py-3 px-4 text-right">Updated</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {extensions.map((ext, idx) => {
              const isCompared = comparedIds.includes(ext.id);
              const isWatchlisted = watchlistedIds.includes(ext.id);
              const trendingPositive = (ext.stats.trendingWeekly || 0) > 0;

              return (
                <tr
                  key={ext.id}
                  onClick={() => onSelect(ext)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-xs">
                    {idx + 1}
                  </td>

                  {/* Extension Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-700/60 overflow-hidden">
                        {ext.icon ? (
                          <img
                            src={ext.icon}
                            alt=""
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Box className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate max-w-[200px] sm:max-w-xs">
                            {ext.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono px-1 py-0.2 rounded bg-slate-800">
                            v{ext.latestVersion}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>{ext.publisher.displayName}</span>
                          {ext.publisher.isVerified && (
                            <BadgeCheck className="w-3 h-3 text-sky-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/40 text-slate-300">
                      {ext.categories?.[0] || 'Utility'}
                    </span>
                  </td>

                  {/* Installs */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className="font-mono font-bold text-white text-xs sm:text-sm"
                      title={formatFullNumber(ext.stats.installs)}
                    >
                      {formatNumber(ext.stats.installs)}
                    </span>
                  </td>

                  {/* Updates */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className="font-mono text-slate-400 text-xs"
                      title={formatFullNumber(ext.stats.updates)}
                    >
                      {formatNumber(ext.stats.updates)}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-mono font-semibold text-slate-200 text-xs">
                        {ext.stats.rating > 0 ? ext.stats.rating : '-'}
                      </span>
                    </div>
                    {ext.stats.ratingCount > 0 && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ({formatNumber(ext.stats.ratingCount)})
                      </span>
                    )}
                  </td>

                  {/* 7d Trend */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                        trendingPositive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      {formatTrendPercent(ext.stats.trendingWeekly)}
                    </span>
                  </td>

                  {/* Updated */}
                  <td className="py-3.5 px-4 text-right text-xs text-slate-400 font-mono whitespace-nowrap">
                    {formatRelativeDate(ext.lastUpdated)}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-center whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {/* Compare toggle */}
                      <button
                        onClick={() => onCompareToggle(ext)}
                        title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isCompared
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Swords className="w-3.5 h-3.5" />
                      </button>

                      {/* Bookmark toggle */}
                      <button
                        onClick={() => onWatchlistToggle(ext)}
                        title={isWatchlisted ? 'Remove from Watchlist' : 'Save to Watchlist'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isWatchlisted
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {isWatchlisted ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy CLI */}
                      <button
                        onClick={(e) => handleCopyCmd(e, ext.id)}
                        title="Copy install command"
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                      >
                        {copiedId === ext.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
