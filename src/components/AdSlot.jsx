import { useEffect, useRef } from 'react';

export default function AdSlot({
  className = '',
  label = 'Sponsored',
}) {
  const adContainerRef = useRef(null);
  const scriptHostRef = useRef(null);

  const adsEnabled = import.meta.env.VITE_ENABLE_ADS === 'true';
  const scriptUrl = import.meta.env.VITE_ADSTERRA_SCRIPT_URL || '';
  const slotId = import.meta.env.VITE_ADSTERRA_SLOT_ID || '';
  const containerId = slotId
    ? slotId.startsWith('container-')
      ? slotId
      : `container-${slotId}`
    : '';

  useEffect(() => {
    const adContainer = adContainerRef.current;
    const scriptHost = scriptHostRef.current;
    if (!adsEnabled || !scriptUrl || !containerId || !adContainer || !scriptHost) {
      return undefined;
    }

    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('async', 'async');
    script.setAttribute('data-cfasync', 'false');
    script.src = scriptUrl;
    scriptHost.appendChild(script);

    return () => {
      script.remove();
      adContainer.replaceChildren();
    };
  }, [adsEnabled, containerId, scriptUrl]);

  const isReady = adsEnabled && Boolean(scriptUrl) && Boolean(containerId);

  return (
    <div className={`ad-slot-shell ${className}`.trim()}>
      <div className="ad-slot-header">{label}</div>
      {isReady ? (
        <div className="ad-slot-content">
          <div
            id={containerId}
            ref={adContainerRef}
            className="ad-slot-embed"
            aria-label={`${label} advertisement`}
          />
          <div ref={scriptHostRef} />
        </div>
      ) : (
        <div className="ad-slot-placeholder">
          Advertisement space ready. Set <span className="font-mono text-indigo-200">VITE_ENABLE_ADS=true</span>,
          <span className="font-mono text-indigo-200"> VITE_ADSTERRA_SCRIPT_URL</span>, and
          <span className="font-mono text-indigo-200"> VITE_ADSTERRA_SLOT_ID</span> to monetize this page.
        </div>
      )}
    </div>
  );
}
