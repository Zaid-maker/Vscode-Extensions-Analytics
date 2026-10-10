// TAB 4: README BADGES — Shields.io badge list with copy-to-clipboard.
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function BadgesTab({ badges }) {
  const [copiedBadge, setCopiedBadge] = useState(null);

  const handleCopyBadge = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBadge(idx);
    setTimeout(() => setCopiedBadge(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Generate real-time Shields.io badges for this extension to embed in your GitHub
        repository <code className="text-indigo-300 font-mono">README.md</code>.
      </p>

      <div className="space-y-3">
        {badges.map((b, idx) => (
          <div
            key={b.label}
            className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                {b.label}
              </span>
              {/* Live Badge Preview */}
              <img src={b.badgeUrl} alt={b.label} className="h-6" />
            </div>

            {/* Markdown snippet */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 truncate">
                {b.markdown}
              </div>
              <button
                onClick={() => handleCopyBadge(b.markdown, idx)}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
              >
                {copiedBadge === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
