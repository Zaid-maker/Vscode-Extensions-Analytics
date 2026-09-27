import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  executeMarketplaceQuery,
  clearMarketplaceCache,
} from '../services/marketplaceApi';

const PROXY_URL = '/api/marketplace/_apis/public/gallery/extensionquery';

function makeApiResponse(count = 1) {
  return {
    results: [
      {
        extensions: [
          {
            extensionId: 'guid-1',
            extensionName: 'testext',
            displayName: 'Test Ext',
            publisher: { publisherName: 'testpub' },
            statistics: [{ statisticName: 'install', value: 1000 }],
            versions: [],
          },
        ],
        resultMetadata: [
          { metadataItems: [{ count, name: 'TotalCount' }] },
        ],
      },
    ],
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const payload = { filters: [{ pageNumber: 1 }], flags: 914 };

beforeEach(() => {
  clearMarketplaceCache();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('executeMarketplaceQuery caching', () => {
  it('serves identical queries from cache without a second network call', async () => {
    fetch.mockResolvedValue(jsonResponse(makeApiResponse()));

    const first = await executeMarketplaceQuery(payload);
    const second = await executeMarketplaceQuery(payload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
    expect(second.totalCount).toBe(1);
  });

  it('dedupes concurrent identical queries into a single request', async () => {
    fetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(jsonResponse(makeApiResponse())), 20))
    );

    const [a, b] = await Promise.all([
      executeMarketplaceQuery(payload),
      executeMarketplaceQuery(payload),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(b).toEqual(a);
  });

  it('treats distinct payloads as distinct cache entries', async () => {
    // Fresh Response per call: a Response body can only be consumed once
    fetch.mockImplementation(() => Promise.resolve(jsonResponse(makeApiResponse())));

    await executeMarketplaceQuery(payload);
    await executeMarketplaceQuery({ ...payload, filters: [{ pageNumber: 2 }] });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('executeMarketplaceQuery resilience', () => {
  it('retries a 403 once, then succeeds on the same endpoint', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ message: 'rate limited' }, 403))
      .mockResolvedValueOnce(jsonResponse(makeApiResponse()));

    const result = await executeMarketplaceQuery(payload);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe(PROXY_URL);
    expect(fetch.mock.calls[1][0]).toBe(PROXY_URL);
    expect(result.extensions).toHaveLength(1);
  });

  it('falls back to the direct endpoint when the proxy keeps failing', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse({}, 403)) // proxy retry
      .mockResolvedValueOnce(jsonResponse(makeApiResponse())); // direct endpoint

    const result = await executeMarketplaceQuery(payload);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[2][0]).toBe(
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery'
    );
    expect(result.extensions).toHaveLength(1);
  });

  it('serves stale cache when every endpoint fails with 403', async () => {
    // Prime the cache
    fetch.mockResolvedValueOnce(jsonResponse(makeApiResponse(7)));
    await executeMarketplaceQuery(payload);

    // Expire the fresh TTL but keep the entry within the stale window
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(Date.now() + 10 * 60 * 1000); // 10 minutes later

    fetch.mockResolvedValue(jsonResponse({}, 403));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await executeMarketplaceQuery(payload);

    expect(result.totalCount).toBe(7);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('serving cached results'),
      expect.any(String)
    );

    warnSpy.mockRestore();
    vi.useRealTimers();
  });

  it('throws when there is no cache and the API is unreachable', async () => {
    fetch.mockResolvedValue(jsonResponse({}, 403));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(executeMarketplaceQuery(payload)).rejects.toThrow(
      /status 403/
    );

    warnSpy.mockRestore();
  });
});
