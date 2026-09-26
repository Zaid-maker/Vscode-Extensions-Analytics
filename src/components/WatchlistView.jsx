import React from 'react';
import {
  BookmarkCheck,
  Star,
  Trash2,
  FileSpreadsheet,
  FileJson,
  Swords,
  Box,
  BadgeCheck,
} from 'lucide-react';
import {
  formatNumber,
  formatTrendPercent,
  formatRelativeDate,
} from '../utils/formatters';

export default function WatchlistView({
  watchlist,
  onRemoveFromWatchlist,
  onClearWatchlist,
  onSelectExtension,
  onCompareToggle,
  comparedIds,
}) {
  // Export as CSV
  const exportCSV = () => {
    if (watchlist.length === 0) return;
    const headers = [
      'Identifier',
      'Display Name',
      'Publisher',
      'Category',
      'Installs',
      'Updates Delivered',
      'Rating',
      'Rating Count',
      '7d Trend Velocity (%)',
      'Latest Version',
      'Last Updated',
    ];

    const rows = watchlist.map((e) => [
      `"${e.id}"`,
      `"${e.displayName.replace(/"/g, '""')}"`,
      `"${e.publisher.displayName.replace(/"/g, '""')}"`,
      `"${e.categories?.[0] || ''}"`,
      e.stats.installs,
      e.stats.updates,
      e.stats.rating,
      e.stats.ratingCount,
      (e.stats.trendingWeekly * 100).toFixed(2),
      `"${e.latestVersion}"`,
      `"${e.lastUpdated}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vscode-extensions-watchlist-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as JSON
  const exportJSON = () => {
    if (watchlist.length === 0) return;
    const jsonStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `vscode-extensions-watchlist-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Watchlist & Saved Extensions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Track your essential toolchain, monitor update velocity, and export reports.
            </p>
          </div>

          {/* Export and Clear buttons */}
          {watchlist.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                title="Download CSV spreadsheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={exportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                title="Download JSON data"
              >
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={onClearWatchlist}
                className="p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
                title="Clear all saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any extension in the Market Explorer to save it here
            for ongoing performance tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((ext) => {
            const isCompared = comparedIds.includes(ext.id);

            return (
              <div
                key={ext.id}
                onClick={() => onSelectExtension(ext)}
                className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 p-1.5 flex items-center justify-center shrink-0 border border-slate-700/60">
                        {ext.icon ? (
                          <img
                            src={ext.icon}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Box className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-100 truncate text-sm">
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

                    {/* Quick remove from watchlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(ext.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {ext.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Installs:</span>
                    <span className="font-mono font-bold text-white">
                      {formatNumber(ext.stats.installs)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Rating:</span>
                    <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{ext.stats.rating > 0 ? ext.stats.rating : '-'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">7-Day Trend:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {formatTrendPercent(ext.stats.trendingWeekly)}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareToggle(ext);
                      }}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        isCompared
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'In Battle' : 'Compare'}</span>
                    </button>

                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatRelativeDate(ext.lastUpdated)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
