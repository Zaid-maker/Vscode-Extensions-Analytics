import React from 'react';

/**
 * Error boundary for React.lazy chunks.
 *
 * When a deploy replaces hashed asset filenames, users with an open tab
 * still reference the old chunk names; clicking a lazy tab/modal then
 * throws "Failed to fetch dynamically imported module". Instead of a
 * blank screen, we offer one in-place retry and then a full reload,
 * which fetches the fresh index.html and its new hashes.
 */
function isChunkLoadError(error) {
  if (!error) return false;
  const msg = String(error.message || error);
  return (
    error.name === 'ChunkLoadError' ||
    /dynamically imported module|importing a module script|Failed to fetch dynamically/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg)
  );
}

export default class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false, retrying: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error) {
    // Non-chunk errors (real app bugs) should still surface in devtools
    if (!isChunkLoadError(error)) {
      console.error('Unhandled render error:', error);
    }
  }

  handleRetry = () => {
    // Clear the failed boundary state and remount the lazy child.
    // location.reload() in a page opened moments ago usually re-resolves
    // the module graph, but a deploy in between may need the full reload.
    this.setState({ retrying: true });
    window.location.reload();
  };

  render() {
    const { hasError, isChunkError, retrying } = this.state;
    const { children, fallbackTitle, compact } = this.props;

    if (!hasError) return children;

    if (compact) {
      // Inline variant for chart panels inside the detail modal
      return (
        <div className="w-full h-56 flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-center px-4">
          <p className="text-xs text-slate-400">
            {isChunkError
              ? 'A new version was deployed. Reload to see this chart.'
              : 'This chart failed to render.'}
          </p>
          <button
            onClick={this.handleRetry}
            disabled={retrying}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-[11px] font-semibold transition-all"
          >
            {retrying ? 'Reloading…' : 'Reload'}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-amber-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992V4.356m0 4.992A8.25 8.25 0 0 0 6.42 5.28L3 8.25m15 8.25-3.42 2.97A8.25 8.25 0 0 1 3.375 16.5h4.992m0 0L3.375 21m4.992-4.492H3.375"
            />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white">
            {fallbackTitle || (isChunkError ? 'App was updated' : 'Something went wrong')}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {isChunkError
              ? 'A new version was deployed while this page was open. Reloading will get you back on the latest version.'
              : 'An unexpected error occurred while rendering this view.'}
          </p>
        </div>
        <button
          onClick={this.handleRetry}
          disabled={retrying}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-all"
        >
          {retrying ? 'Reloading…' : 'Reload latest version'}
        </button>
      </div>
    );
  }
}
