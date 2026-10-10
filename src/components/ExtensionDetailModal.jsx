// Extension Deep Analytics Modal — shell only.
//
// State, data fetching (full details + related extensions), keyboard handling
// and derived analytics live here; the rendered sections live in
// src/components/detail/:
//   ModalHeader  — banner, action toolbar, external links
//   ModalTabs    — tab navigation row (exports DETAIL_TABS ids)
//   OverviewTab  — metrics, charts, description, related extensions
//   GrowthTab    — milestone tracker, projection chart & points
//   ReleasesTab  — cadence KPIs, timeline chart, version history
//   BadgesTab    — Shields.io badges with copy buttons
//   ChartLoader  — shared chart placeholder
//   useCopyConfirmation — clipboard + confirmation state

import React, { useState, useEffect } from 'react';
import { getExtensionDetails, searchExtensions, SortBy } from '../services/marketplaceApi';
import {
  calculateMilestones,
  generateGrowthProjections,
  analyzeReleaseCadence,
} from '../utils/projections';
import { generateBadges } from '../utils/badges';
import ModalHeader from './detail/ModalHeader';
import ModalTabs from './detail/ModalTabs';
import OverviewTab from './detail/OverviewTab';
import GrowthTab from './detail/GrowthTab';
import ReleasesTab from './detail/ReleasesTab';
import BadgesTab from './detail/BadgesTab';

export default function ExtensionDetailModal({
  extension: initialExtension,
  onClose,
  onCompareToggle,
  isCompared,
  isWatchlisted,
  onWatchlistToggle,
  onSelectPublisher,
  onRelatedSelect,
}) {
  const [detailedExtension, setDetailedExtension] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'growth' | 'releases' | 'badges'
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch full details (with all versions and metadata flags)
  useEffect(() => {
    let isMounted = true;
    async function loadFullDetails() {
      if (!initialExtension?.id) return;
      try {
        setLoadingDetails(true);
        const detailed = await getExtensionDetails(initialExtension.id);
        if (isMounted && detailed) {
          setDetailedExtension(detailed);
        }
      } catch (err) {
        console.warn('Failed to load full extension details:', err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    }
    loadFullDetails();
    return () => {
      isMounted = false;
    };
  }, [initialExtension?.id]);

  // Related extensions: same first category, sorted by installs, top 6,
  // current one filtered out. Cached like every other marketplace query.
  // State is keyed by extension id so a stale fetch can never render for a
  // different extension; setters fire only from async callbacks.
  const [relatedState, setRelatedState] = useState({ id: null, loading: false, items: [] });
  const relatedCategoryId = initialExtension?.categories?.[0] || null;
  useEffect(() => {
    if (!relatedCategoryId) return undefined;
    let isMounted = true;
    const requestedId = initialExtension?.id;
    searchExtensions({
      category: relatedCategoryId,
      sortBy: SortBy.INSTALL_COUNT,
      pageSize: 7,
    })
      .then(({ extensions = [] }) => {
        if (isMounted) {
          setRelatedState({
            id: requestedId,
            loading: false,
            items: extensions.filter((e) => e.id !== requestedId).slice(0, 6),
          });
        }
      })
      .catch((err) => {
        console.warn('Related fetch failed:', err);
        if (isMounted) setRelatedState({ id: requestedId, loading: false, items: [] });
      });
    return () => {
      isMounted = false;
    };
  }, [relatedCategoryId, initialExtension?.id]);
  const related = relatedState.id === initialExtension?.id ? relatedState.items : [];
  const loadingRelated = relatedState.id === initialExtension?.id ? relatedState.loading : Boolean(relatedCategoryId);

  // Esc closes the modal; focus lands on the container so the listener is
  // deterministic rather than depending on what the user last clicked.
  const containerRef = React.useRef(null);
  useEffect(() => {
    containerRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Derived extension object that prioritizes non-zero stats
  const extension = detailedExtension?.id === initialExtension?.id
    ? {
        ...initialExtension,
        ...detailedExtension,
        stats:
          detailedExtension.stats &&
          (detailedExtension.stats.installs > 0 || detailedExtension.stats.rating > 0)
            ? detailedExtension.stats
            : initialExtension.stats,
      }
    : initialExtension;

  if (!extension) return null;

  // Growth & Cadence calculations
  const milestones = calculateMilestones(
    extension.stats.installs,
    extension.stats.trendingWeekly
  );
  const projections = generateGrowthProjections(
    extension.stats.installs,
    extension.stats.trendingWeekly
  );
  const cadence = analyzeReleaseCadence(extension.versions);
  const badges = generateBadges(extension);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${extension.displayName} details`}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 outline-none"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <ModalHeader
          extension={extension}
          loadingDetails={loadingDetails}
          isCompared={isCompared}
          isWatchlisted={isWatchlisted}
          onCompareToggle={onCompareToggle}
          onWatchlistToggle={onWatchlistToggle}
          onSelectPublisher={onSelectPublisher}
          onClose={onClose}
        />

        <ModalTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              extension={extension}
              related={related}
              loadingRelated={loadingRelated}
              onRelatedSelect={onRelatedSelect}
            />
          )}
          {activeTab === 'growth' && (
            <GrowthTab extension={extension} milestones={milestones} projections={projections} />
          )}
          {activeTab === 'releases' && (
            <ReleasesTab extension={extension} cadence={cadence} />
          )}
          {activeTab === 'badges' && <BadgesTab badges={badges} />}
        </div>
      </div>
    </div>
  );
}
