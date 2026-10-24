// Modal top banner: icon, title, version/category chips, publisher link,
// last-updated stamp and the quick-action toolbar (install cmd / compare /
// watchlist / share / external links).
import {
  X,
  BadgeCheck,
  Building,
  Clock,
  Box,
  Copy,
  Check,
  Code,
  Swords,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatters';
import { generateCliCommand } from '../../utils/badges';
import useCopyConfirmation from './useCopyConfirmation';
import MaintenanceBadge from '../MaintenanceBadge';

export default function ModalHeader({
  extension,
  loadingDetails,
  isCompared,
  isWatchlisted,
  onCompareToggle,
  onWatchlistToggle,
  onSelectPublisher,
  onClose,
}) {
  const [copiedCmd, copyCmd] = useCopyConfirmation();
  const [copiedShare, copyShare] = useCopyConfirmation();

  return (
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
            <MaintenanceBadge lastUpdated={extension.lastUpdated} />
          </div>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
        {/* Terminal install command */}
        <button
          onClick={() => copyCmd(generateCliCommand(extension.id))}
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

        {/* Share: copies the shareable /extension/<id> URL */}
        <button
          onClick={() => copyShare(`https://vscode-extensions-analytics.vercel.app/extension/${extension.id}`)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
            copiedShare
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="Copy shareable link"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Share</span>
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
  );
}
