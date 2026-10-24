import { maintenanceStatus, maintenanceMeta } from '../utils/maintenance';

// Dot + short label signaling how recently the extension was last updated.
// Renders nothing when no usable timestamp is available.
export default function MaintenanceBadge({ lastUpdated, className = '' }) {
  const status = maintenanceStatus(lastUpdated);
  const meta = maintenanceMeta(status);
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] text-slate-400 ${className}`}
      title={meta.hint}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: meta.color }}
      />
      <span>{meta.shortLabel}</span>
    </span>
  );
}
