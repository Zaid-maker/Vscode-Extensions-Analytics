import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdSlot from '../components/AdSlot';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('AdSlot', () => {
  it('renders the Adsterra container before its async script', () => {
    vi.stubEnv('VITE_ENABLE_ADS', 'true');
    vi.stubEnv('VITE_ADSTERRA_SCRIPT_URL', 'https://ads.example.test/zone.js');
    vi.stubEnv('VITE_ADSTERRA_SLOT_ID', 'container-zone-123');

    const { container } = render(<AdSlot />);
    const adContainer = container.querySelector('#container-zone-123');
    const script = container.querySelector('script[src="https://ads.example.test/zone.js"]');

    expect(adContainer).toBeInTheDocument();
    expect(script).toHaveAttribute('async');
    expect(script).toHaveAttribute('data-cfasync', 'false');
    expect(
      adContainer.compareDocumentPosition(script) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('keeps the placeholder visible if the ad container ID is missing', () => {
    vi.stubEnv('VITE_ENABLE_ADS', 'true');
    vi.stubEnv('VITE_ADSTERRA_SCRIPT_URL', 'https://ads.example.test/zone.js');
    vi.stubEnv('VITE_ADSTERRA_SLOT_ID', '');

    const { container, getByText } = render(<AdSlot />);

    expect(getByText(/Advertisement space ready/)).toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
  });
});
