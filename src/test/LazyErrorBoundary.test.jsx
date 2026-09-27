import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyErrorBoundary from '../components/LazyErrorBoundary';

// A component that throws on every render
function Bomb({ chunkStyle }) {
  const err = new Error(
    chunkStyle
      ? 'Failed to fetch dynamically imported module: http://x/assets/WatchlistView-abc.js'
      : 'Cannot read properties of undefined (reading "map")'
  );
  if (chunkStyle) err.name = 'ChunkLoadError';
  throw err;
}

describe('LazyErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <LazyErrorBoundary>
        <p>all good</p>
      </LazyErrorBoundary>
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('shows the stale-deploy recovery UI for chunk-load errors', () => {
    // Silence the expected React error from the throwing child
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <LazyErrorBoundary>
        <Bomb chunkStyle />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('App was updated')).toBeInTheDocument();
    expect(
      screen.getByText(/new version was deployed/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reload latest version/i })
    ).toBeInTheDocument();
    spy.mockRestore();
  });

  it('shows the generic message for non-chunk render errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <LazyErrorBoundary>
        <Bomb />
      </LazyErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/unexpected error occurred/i)
    ).toBeInTheDocument();
    spy.mockRestore();
  });
});
