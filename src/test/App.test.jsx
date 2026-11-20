import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { searchExtensionsMock } = vi.hoisted(() => ({
  searchExtensionsMock: vi.fn(),
}));

vi.mock('../services/marketplaceApi', () => ({
  searchExtensions: searchExtensionsMock,
  getExtensionDetails: vi.fn(),
  SortBy: { INSTALL_COUNT: 4 },
}));

vi.mock('../components/AdSlot', () => ({
  default: ({ label }) => <div data-testid="ad-slot">{label}</div>,
}));

import App from '../App';

describe('App ad placement fallbacks', () => {
  beforeEach(() => {
    searchExtensionsMock.mockReset();
    window.history.replaceState({}, '', '/');
  });

  it('keeps the ad slot available when the marketplace request fails', async () => {
    searchExtensionsMock.mockRejectedValueOnce(new Error('Marketplace API failed with status 403'));

    render(<App />);

    expect(await screen.findByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByTestId('ad-slot')).toBeInTheDocument();
  });

  it('keeps the ad slot available when the selected search has no results', async () => {
    searchExtensionsMock.mockResolvedValueOnce({ extensions: [], totalCount: 0 });

    render(<App />);

    expect(await screen.findByText('No Extensions Found')).toBeInTheDocument();
    expect(screen.getByTestId('ad-slot')).toBeInTheDocument();
  });
});
