import { useEffect } from 'react';

/**
 * Keeps document.title and the meta description in sync with the active view.
 *
 * Social crawlers (Facebook/X/LinkedIn) don't execute JavaScript, so the
 * static Open Graph / Twitter tags in index.html intentionally stay untouched;
 * this targets Google and browser tabs, which do re-read these on the fly.
 */
export default function useDocumentMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
