import React, { useState } from 'react';
import {
  Download,
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
  formatRelativeDate,
  formatTrendPercent,
} from '../utils/formatters';

export default function ExtensionCard({
  extension,
  onSelect,
  onCompareToggle,
  isCompared,
  isWatchlisted,
  onWatchlistToggle,
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyCmd = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`code --install-extension ${extension.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trendingPositive = (extension.stats.trendingWeekly || 0) > 0;

  return (
    <div
      onClick={() => onSelect(extension)}
      className="group glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-300 relative shadow-lg shadow-black/20 hover:shadow-indigo-500/10 hover:-translate-y-1"
    >
      {/* Top Header: Icon + Name + Quick Actions */}
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          {/* Extension Icon */}
          <div className="w-13 h-13 rounded-xl bg-slate-800/90 border border-slate-700/60 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:border-indigo-500/30 transition-all">
            {extension.icon && !imgError ? (
              <img
                src={extension.icon}
                alt={extension.displayName}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <Box className="w-7 h-7 text-indigo-400" />
            )}
          </div>

          {/* Titles & Publisher */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 truncate transition-colors">
                {extension.displayName}
              </h3>
              {/* Top Quick Actions */}
              <div
                className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onWatchlistToggle(extension)}
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
                <button
                  onClick={() => onCompareToggle(extension)}
                  title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isCompared
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Publisher Name with verification */}
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
              <span className="font-medium text-slate-300 truncate">
                {extension.publisher.displayName}
              </span>
              {extension.publisher.isVerified && (
                <span title="Verified Publisher">
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                </span>
              )}
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-slate-400">
                v{extension.latestVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
          {extension.description}
        </p>
      </div>

      {/* Stats & Footer */}
      <div>
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3">
          {/* Installs */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">
                Installs
              </div>
              <div className="font-mono text-xs font-bold text-white">
                {formatNumber(extension.stats.installs)}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">
                Rating
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs font-bold text-white">
                  {extension.stats.rating > 0 ? extension.stats.rating : 'N/A'}
                </span>
                {extension.stats.ratingCount > 0 && (
                  <span className="text-[10px] text-slate-400">
                    ({formatNumber(extension.stats.ratingCount)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Velocity & Update info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          {/* Trending velocity pill & relative date */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                trendingPositive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>{formatTrendPercent(extension.stats.trendingWeekly)} 7d</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
              {formatRelativeDate(extension.lastUpdated)}
            </span>
          </div>

          {/* Copy CLI install command */}
          <button
            onClick={handleCopyCmd}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 font-mono py-1 px-2 rounded-lg hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
            title="Copy VS Code terminal install command"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">code install</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
