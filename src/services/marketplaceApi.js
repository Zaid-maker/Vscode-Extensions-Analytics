// VS Code Marketplace API client with caching and fallback support

const MARKETPLACE_DIRECT_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
const MARKETPLACE_PROXY_URL = '/api/marketplace/_apis/public/gallery/extensionquery';

// In-memory cache for API queries
const queryCache = new Map();

/**
 * FilterType constants for VS Code gallery API
 */
export const FilterType = {
  TAG: 1,
  EXTENSION_ID: 4,
  CATEGORY: 5,
  EXTENSION_NAME: 7, // publisher.extensionName
  TARGET: 8,         // Microsoft.VisualStudio.Code
  SEARCH_TEXT: 10,
  EXCLUDE_FLAGS: 12,
};

/**
 * SortBy options for VS Code gallery API
 */
export const SortBy = {
  RELEVANCE: 0,
  INSTALL_COUNT: 4,
  AVERAGE_RATING: 5,
  TITLE: 6,
  TRENDING_DAILY: 7,
  TRENDING_WEEKLY: 8,
  TRENDING_MONTHLY: 9,
  RELEASE_DATE: 10,
  LAST_UPDATED: 12,
  WEIGHTED_RATING: 13,
};

/**
 * Flags for query:
 * 0x1: IncludeVersions
 * 0x2: IncludeFiles
 * 0x4: IncludeCategoryAndTags
 * 0x8: IncludeSharedAccounts
 * 0x10: IncludeVersionProperties
 * 0x20: ExcludeNonValidated
 * 0x40: IncludeInstallationTargets
 * 0x80: IncludeAssetUri
 * 0x100: IncludeStatistics
 * 0x200: IncludeLatestVersionOnly
 */
export const Flags = {
  SUMMARY: 914, // Versions, Files, Categories, VersionProperties, Statistics, AssetUri
  DETAILED: 914, // Include Statistics, Version Properties, Files, AssetUri
};

/**
 * Normalize an extension object from the raw gallery response
 */
export function normalizeExtension(raw) {
  if (!raw) return null;

  const publisher = raw.publisher || {};
  const statsList = raw.statistics || [];
  
  const statsMap = {};
  statsList.forEach((s) => {
    if (s && s.statisticName) {
      statsMap[s.statisticName.toLowerCase()] = s.value;
    }
  });

  const installs = Math.round(statsMap.install || 0);
  const updates = Math.round(statsMap.updatecount || 0);
  const downloads = Math.round(statsMap.downloadcount || 0);
  const totalActivity = installs + updates;
  const rating = Number(Number(statsMap.averagerating || 0).toFixed(2));
  const ratingCount = Math.round(statsMap.ratingcount || 0);
  const weightedRating = Number(Number(statsMap.weightedrating || 0).toFixed(2));
  const trendingDaily = Number(statsMap.trendingdaily || 0);
  const trendingWeekly = Number(statsMap.trendingweekly || 0);
  const trendingMonthly = Number(statsMap.trendingmonthly || 0);

  const versions = (raw.versions || []).map((v) => ({
    version: v.version,
    lastUpdated: v.lastUpdated,
    targetPlatform: v.targetPlatform || 'universal',
    assetUri: v.assetUri,
    filesCount: v.files?.length || 0,
    properties: (v.properties || []).reduce((acc, p) => {
      acc[p.key] = p.value;
      return acc;
    }, {}),
  }));

  const latestVersionObj = raw.versions?.[0] || {};
  const files = latestVersionObj.files || [];

  const iconAsset = files.find(
    (f) =>
      f.assetType === 'Microsoft.VisualStudio.Services.Icons.Default' ||
      f.assetType === 'Microsoft.VisualStudio.Services.Icons.Small'
  );

  const changelogAsset = files.find(
    (f) => f.assetType === 'Microsoft.VisualStudio.Services.Content.Changelog'
  );

  const detailsAsset = files.find(
    (f) => f.assetType === 'Microsoft.VisualStudio.Services.Content.Details'
  );

  const vsixAsset = files.find(
    (f) => f.assetType === 'Microsoft.VisualStudio.Services.VSIXPackage'
  );

  const props = latestVersionObj.properties || [];
  const propsMap = {};
  props.forEach((p) => {
    if (p && p.key) propsMap[p.key] = p.value;
  });

  const repoUrl =
    propsMap['Microsoft.VisualStudio.Services.Links.Source'] ||
    propsMap['Microsoft.VisualStudio.Services.Links.GitHub'] ||
    propsMap['Microsoft.VisualStudio.Services.Links.Getstarted'] ||
    '';

  const issuesUrl = propsMap['Microsoft.VisualStudio.Services.Links.Support'] || '';
  const brandColor = propsMap['Microsoft.VisualStudio.Services.Branding.Color'] || '#3b82f6';
  const brandTheme = propsMap['Microsoft.VisualStudio.Services.Branding.Theme'] || 'dark';
  const engine = propsMap['Microsoft.VisualStudio.Code.Engine'] || '^1.70.0';

  const identifier = `${publisher.publisherName}.${raw.extensionName}`;

  return {
    id: identifier,
    extensionId: raw.extensionId,
    name: raw.extensionName,
    displayName: raw.displayName || raw.extensionName,
    description: raw.shortDescription || 'No description provided.',
    publisher: {
      name: publisher.publisherName,
      displayName: publisher.displayName || publisher.publisherName,
      isVerified: Boolean(publisher.flags === 'verified' || publisher.isDomainVerified),
      domain: publisher.domain || '',
    },
    icon: iconAsset?.source || null,
    categories: raw.categories || ['Other'],
    tags: (raw.tags || []).filter((t) => !t.startsWith('__')),
    publishedDate: raw.publishedDate || raw.releaseDate,
    releaseDate: raw.releaseDate,
    lastUpdated: raw.lastUpdated || latestVersionObj.lastUpdated,
    latestVersion: latestVersionObj.version || '1.0.0',
    versionsCount: raw.versions?.length || 1,
    versions,
    stats: {
      installs,
      updates,
      downloads,
      totalActivity,
      rating,
      ratingCount,
      weightedRating,
      trendingDaily,
      trendingWeekly,
      trendingMonthly,
    },
    links: {
      marketplace: `https://marketplace.visualstudio.com/items?itemName=${identifier}`,
      repository: repoUrl,
      issues: issuesUrl,
      changelog: changelogAsset?.source || null,
      readme: detailsAsset?.source || null,
      vsix: vsixAsset?.source || null,
    },
    branding: {
      color: brandColor,
      theme: brandTheme,
    },
    engine,
  };
}

/**
 * Execute query against VS Code marketplace API with automatic fallback
 */
export async function executeMarketplaceQuery(bodyPayload) {
  const cacheKey = JSON.stringify(bodyPayload);
  if (queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey);
    // Cache valid for 3 minutes
    if (Date.now() - cached.timestamp < 180000) {
      return cached.data;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json;api-version=3.0-preview.1',
  };

  let response;
  // Try proxy first if on localhost, else fallback to direct
  try {
    response = await fetch(MARKETPLACE_PROXY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });
    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`);
    }
  } catch {
    // Fallback to direct marketplace endpoint
    response = await fetch(MARKETPLACE_DIRECT_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });
  }

  if (!response.ok) {
    throw new Error(`Marketplace API failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawExtensions = data.results?.[0]?.extensions || [];
  const totalCount =
    data.results?.[0]?.resultMetadata?.[0]?.metadataItems?.[0]?.count ||
    rawExtensions.length;

  const normalized = rawExtensions.map(normalizeExtension).filter(Boolean);

  const result = {
    extensions: normalized,
    totalCount,
  };

  queryCache.set(cacheKey, {
    timestamp: Date.now(),
    data: result,
  });

  return result;
}

/**
 * Query extensions with search, category, sort and pagination
 */
export async function searchExtensions({
  searchText = '',
  category = 'All',
  sortBy = SortBy.INSTALL_COUNT,
  sortOrder = 0,
  pageNumber = 1,
  pageSize = 24,
} = {}) {
  const criteria = [
    { filterType: FilterType.TARGET, value: 'Microsoft.VisualStudio.Code' },
  ];

  if (category && category !== 'All') {
    criteria.push({ filterType: FilterType.CATEGORY, value: category });
  }

  if (searchText && searchText.trim()) {
    criteria.push({ filterType: FilterType.SEARCH_TEXT, value: searchText.trim() });
  }

  const payload = {
    filters: [
      {
        criteria,
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    ],
    flags: Flags.SUMMARY,
  };

  return executeMarketplaceQuery(payload);
}

/**
 * Get detailed analytics for a specific extension by its full identifier (e.g. 'ms-python.python')
 */
export async function getExtensionDetails(extensionId) {
  const payload = {
    filters: [
      {
        criteria: [
          { filterType: FilterType.EXTENSION_NAME, value: extensionId.trim() },
        ],
        pageNumber: 1,
        pageSize: 1,
        sortBy: 0,
        sortOrder: 0,
      },
    ],
    flags: Flags.DETAILED,
  };

  const res = await executeMarketplaceQuery(payload);
  return res.extensions[0] || null;
}

/**
 * Fetch a batch of extensions by their IDs (useful for comparison view)
 */
export async function getExtensionsBatch(extensionIds) {
  if (!extensionIds || extensionIds.length === 0) return [];

  const promises = extensionIds.map((id) =>
    getExtensionDetails(id).catch((err) => {
      console.warn(`Failed to fetch extension ${id}:`, err);
      return null;
    })
  );

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

/**
 * Query extensions published by a specific publisher
 */
export async function getPublisherExtensions(publisherName, pageSize = 50) {
  const payload = {
    filters: [
      {
        criteria: [
          { filterType: FilterType.TARGET, value: 'Microsoft.VisualStudio.Code' },
          { filterType: FilterType.SEARCH_TEXT, value: `publisher:${publisherName}` },
        ],
        pageNumber: 1,
        pageSize,
        sortBy: SortBy.INSTALL_COUNT,
        sortOrder: 0,
      },
    ],
    flags: Flags.SUMMARY,
  };

  const res = await executeMarketplaceQuery(payload);
  // Filter accurately by exact publisher name match
  const filtered = res.extensions.filter(
    (ext) =>
      ext.publisher.name.toLowerCase() === publisherName.toLowerCase() ||
      ext.publisher.displayName.toLowerCase() === publisherName.toLowerCase()
  );

  return filtered.length > 0 ? filtered : res.extensions;
}
