// Copy-to-clipboard with a two-second "copied" confirmation state.
import { useState, useCallback, useRef } from 'react';

export default function useCopyConfirmation() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  return [copied, copy];
}
