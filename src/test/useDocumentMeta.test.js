import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useDocumentMeta from '../hooks/useDocumentMeta';

describe('useDocumentMeta', () => {
  beforeEach(() => {
    // innerHTML wipe first: it would remove a <title> element created by
    // the document.title assignment below (jsdom keeps it inside <head>)
    document.head.innerHTML =
      '<meta name="description" content="original description" />';
    document.title = 'original';
  });

  it('syncs document.title and meta description', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Battle Arena — Test',
        description: 'battle description',
      })
    );

    expect(document.title).toBe('Battle Arena — Test');
    expect(
      document.querySelector('meta[name="description"]').getAttribute('content')
    ).toBe('battle description');
  });

  it('updates again when values change (per-tab switching)', () => {
    const { rerender } = renderHook(
      ({ title, description }) => useDocumentMeta({ title, description }),
      { initialProps: { title: 'Explore', description: 'explore d' } }
    );

    rerender({ title: 'Watchlist', description: 'watchlist d' });

    expect(document.title).toBe('Watchlist');
    expect(
      document.querySelector('meta[name="description"]').getAttribute('content')
    ).toBe('watchlist d');
  });

  it('leaves title/description alone when not provided', () => {
    renderHook(() => useDocumentMeta({}));

    expect(document.title).toBe('original');
    expect(
      document.querySelector('meta[name="description"]').getAttribute('content')
    ).toBe('original description');
  });
});
