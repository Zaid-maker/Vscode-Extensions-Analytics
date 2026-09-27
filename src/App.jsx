import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import FilterBar from './components/FilterBar';
import ExtensionCard from './components/ExtensionCard';
import ExtensionTable from './components/ExtensionTable';
import LazyErrorBoundary from './components/LazyErrorBoundary';

// Code-split heavy, conditionally-rendered views so recharts & co. only load
// when their tab/modal is actually opened (Core Web Vitals / initial bundle).
// Factories are kept separately so the idle prefetch can call them directly.
const loadExtensionDetailModal = () => import('./components/ExtensionDetailModal');
const loadComparisonArena = () => import('./components/ComparisonArena');
const loadPublisherAnalytics = () => import('./components/PublisherAnalytics');
const loadWatchlistView = () => import('./components/WatchlistView');

const ExtensionDetailModal = lazy(loadExtensionDetailModal);
const ComparisonArena = lazy(loadComparisonArena);
const PublisherAnalytics = lazy(loadPublisherAnalytics);
const WatchlistView = lazy(loadWatchlistView);
import {
  searchExtensions,
  SortBy,
} from './services/marketplaceApi';
import useDocumentMeta from './hooks/useDocumentMeta';
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  Layers,
  ExternalLink,
} from 'lucide-react';

const WATCHLIST_STORAGE_KEY = 'vscode_ext_watchlist_v1';

// Per-tab titles & descriptions (Google re-reads these; social crawlers use
// the static OG tags in index.html and don't run JS)
const TAB_META = {
  explore: {
    title: 'ExtensionPulse — VS Code Extensions Analytics, Download Trends & Intelligence',
    description:
      'Discover live VS Code marketplace extension analytics, download velocity, real-time install stats, release cadence, publisher market share, and head-to-head comparisons.',
  },
  compare: {
    title: 'Battle Arena — Compare VS Code Extensions Side-by-Side | ExtensionPulse',
    description:
      'Benchmark VS Code extensions head-to-head on downloads, trending velocity, and ratings in real time.',
  },
  publishers: {
    title: 'Publisher Intelligence — VS Code Market Share & Portfolios | ExtensionPulse',
    description:
      'Analyze VS Code publishers by total installs, portfolio size, market share, and release cadence across their extensions.',
  },
  watchlist: {
    title: 'Your Watchlist — Track VS Code Extensions | ExtensionPulse',
    description:
      'Monitor your saved VS Code extensions: install trends, update velocity, and exportable reports.',
  },
};

// Shared fallback for lazily-loaded tab views
function TabLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
      <Loader2 className="w-9 h-9 animate-spin text-indigo-400" />
      <p className="text-sm font-medium">Loading view...</p>
    </div>
  );
}

// Overlay fallback for the lazily-loaded detail modal
function ModalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f17]/80 backdrop-blur-sm">
      <Loader2 className="w-9 h-9 animate-spin text-indigo-400" />
    </div>
  );
}

export default function App() {
  // Navigation & View
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'compare' | 'publishers' | 'watchlist'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState(SortBy.INSTALL_COUNT);
  const [pageNumber, setPageNumber] = useState(1);

  // Data states
  const [extensions, setExtensions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Deep Dive & Modal states
  const [selectedExtension, setSelectedExtension] = useState(null);

  // Comparison Arena state (up to 4 extensions)
  const [comparedExtensions, setComparedExtensions] = useState([]);

  // Publisher view state
  const [selectedPublisher, setSelectedPublisher] = useState('Microsoft');

  // Watchlist state (stored in localStorage)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (err) {
      console.warn('Failed to save watchlist to localStorage:', err);
    }
  }, [watchlist]);

  // Warm the lazy tab chunks once the browser is idle: first tab switch is
  // instant instead of paying the fetch + parse while the spinner shows.
  useEffect(() => {
    const warm = (load) => {
      load().catch(() => {}); // network hiccups here are fine; the error boundary still covers real failures
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => {
        warm(loadExtensionDetailModal); warm(loadComparisonArena); warm(loadPublisherAnalytics); warm(loadWatchlistView);
      }, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => {
      warm(loadExtensionDetailModal); warm(loadComparisonArena); warm(loadPublisherAnalytics); warm(loadWatchlistView);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Fetch extensions query
  const loadExtensions = useCallback(
    async (resetPage = true) => {
      const page = resetPage ? 1 : pageNumber + 1;
      if (resetPage) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await searchExtensions({
          searchText: searchQuery,
          category: selectedCategory,
          sortBy,
          pageNumber: page,
          pageSize: 24,
        });

        if (resetPage) {
          setExtensions(res.extensions);
          setPageNumber(1);
        } else {
          setExtensions((prev) => [...prev, ...res.extensions]);
          setPageNumber(page);
        }
        setTotalCount(res.totalCount);
      } catch (err) {
        console.error('Search error:', err);
        setError('Unable to fetch extensions from the VS Code Marketplace. Please retry.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery, selectedCategory, sortBy, pageNumber]
  );

  // Trigger search on filter changes with debounce for text input
  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadExtensions(true);
      },
      searchQuery ? 350 : 0
    );

    return () => clearTimeout(timer);
  }, [loadExtensions, searchQuery]);

  // Manual refresh handler — bypasses the TTL cache so the button
  // always means "go get the latest from the marketplace"
  const handleRefresh = () => {
    setIsRefreshing(true);
    searchExtensions({
      searchText: searchQuery,
      category: selectedCategory,
      sortBy,
      pageNumber: 1,
      pageSize: 24,
      force: true,
    })
      .then((res) => {
        setExtensions(res.extensions);
        setPageNumber(1);
        setTotalCount(res.totalCount);
        setError(null);
      })
      .catch(() => setError('Unable to fetch extensions from the VS Code Marketplace. Please retry.'))
      .finally(() => setIsRefreshing(false));
  };

  // Compare toggling
  const handleCompareToggle = (ext) => {
    setComparedExtensions((prev) => {
      const exists = prev.some((e) => e.id === ext.id);
      if (exists) {
        return prev.filter((e) => e.id !== ext.id);
      }
      if (prev.length >= 4) {
        // Replace oldest or alert
        return [...prev.slice(1), ext];
      }
      return [...prev, ext];
    });
  };

  // Watchlist toggling
  const handleWatchlistToggle = (ext) => {
    setWatchlist((prev) => {
      const exists = prev.some((e) => e.id === ext.id);
      if (exists) {
        return prev.filter((e) => e.id !== ext.id);
      }
      return [...prev, ext];
    });
  };

  const comparedIds = comparedExtensions.map((e) => e.id);
  const watchlistedIds = watchlist.map((e) => e.id);

  // Sync tab title & meta description with the active view
  useDocumentMeta(TAB_META[activeTab] || TAB_META.explore);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Visually-hidden page heading: SEO + screen reader anchor */}
        <h1 className="sr-only">
          ExtensionPulse — VS Code Extension Analytics, Download Trends &amp; Comparisons
        </h1>

        {/* TAB 1: EXPLORER & LEADERBOARD */}
        {activeTab === 'explore' && (
          <div>
            {/* Ecosystem KPI Cards */}
            <MetricCards
              extensions={extensions}
              totalCount={totalCount}
              isLoading={isLoading}
            />

            {/* Filter & Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalResults={totalCount}
            />

            {/* Content Display: Loading, Error, Grid or Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <Loader2 className="w-9 h-9 animate-spin text-indigo-400" />
                <p className="text-sm font-medium">
                  Retrieving extension data from VS Code Marketplace...
                </p>
              </div>
            ) : error ? (
              <div className="glass-panel p-8 rounded-2xl border border-rose-500/20 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Connection Error</h3>
                <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => loadExtensions(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Retry Connection
                </button>
              </div>
            ) : extensions.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
                <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Extensions Found</h3>
                <p className="text-xs text-slate-400">
                  Try adjusting your search terms or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {extensions.map((ext) => (
                  <ExtensionCard
                    key={ext.id}
                    extension={ext}
                    onSelect={setSelectedExtension}
                    onCompareToggle={handleCompareToggle}
                    isCompared={comparedIds.includes(ext.id)}
                    isWatchlisted={watchlistedIds.includes(ext.id)}
                    onWatchlistToggle={handleWatchlistToggle}
                  />
                ))}
              </div>
            ) : (
              <ExtensionTable
                extensions={extensions}
                onSelect={setSelectedExtension}
                onCompareToggle={handleCompareToggle}
                comparedIds={comparedIds}
                watchlistedIds={watchlistedIds}
                onWatchlistToggle={handleWatchlistToggle}
              />
            )}

            {/* Pagination / Load More Button */}
            {!isLoading && extensions.length > 0 && extensions.length < totalCount && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => loadExtensions(false)}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition-all shadow-md disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Loading more extensions...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Extensions</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </>
                  )}
                </button>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Showing {extensions.length} of {totalCount.toLocaleString()} extensions
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BATTLE ARENA (COMPARISON) */}
        {activeTab === 'compare' && (
          <LazyErrorBoundary>
            <Suspense fallback={<TabLoader />}>
              <ComparisonArena
            comparedExtensions={comparedExtensions}
            onRemoveFromCompare={(id) =>
              setComparedExtensions((prev) => prev.filter((e) => e.id !== id))
            }
            onClearCompare={() => setComparedExtensions([])}
            onAddExtensionById={(ext) => {
              if (!comparedExtensions.some((e) => e.id === ext.id)) {
                setComparedExtensions((prev) =>
                  prev.length >= 4 ? [...prev.slice(1), ext] : [...prev, ext]
                );
              }
            }}
            onSelectExtension={setSelectedExtension}
          />
            </Suspense>
          </LazyErrorBoundary>
        )}

        {/* TAB 3: PUBLISHER INTELLIGENCE */}
        {activeTab === 'publishers' && (
          <LazyErrorBoundary>
            <Suspense fallback={<TabLoader />}>
              <PublisherAnalytics
            selectedPublisherName={selectedPublisher}
            onSelectPublisher={setSelectedPublisher}
            onSelectExtension={setSelectedExtension}
          />
            </Suspense>
          </LazyErrorBoundary>
        )}

        {/* TAB 4: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <LazyErrorBoundary>
            <Suspense fallback={<TabLoader />}>
              <WatchlistView
            watchlist={watchlist}
            onRemoveFromWatchlist={(id) =>
              setWatchlist((prev) => prev.filter((e) => e.id !== id))
            }
            onClearWatchlist={() => setWatchlist([])}
            onSelectExtension={setSelectedExtension}
            onCompareToggle={handleCompareToggle}
            comparedIds={comparedIds}
          />
            </Suspense>
          </LazyErrorBoundary>
        )}
      </main>

      {/* Extension Deep Analytics Modal / Drawer */}
      {selectedExtension && (
        <LazyErrorBoundary>
          <Suspense fallback={<ModalLoader />}>
            <ExtensionDetailModal
          extension={selectedExtension}
          onClose={() => setSelectedExtension(null)}
          onCompareToggle={handleCompareToggle}
          isCompared={comparedIds.includes(selectedExtension.id)}
          isWatchlisted={watchlistedIds.includes(selectedExtension.id)}
          onWatchlistToggle={handleWatchlistToggle}
          onSelectPublisher={(pubName) => {
            setSelectedPublisher(pubName);
            setActiveTab('publishers');
          }}
          />
          </Suspense>
        </LazyErrorBoundary>
      )}

      {/* Sleek Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-12 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">ExtensionPulse</span>
            <span>•</span>
            <span>Real-time VS Code Marketplace Analytics</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://marketplace.visualstudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <span>VS Code Marketplace</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://code.visualstudio.com/api"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              VS Code API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}