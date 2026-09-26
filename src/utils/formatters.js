// Utility formatting functions for VS Code Analytics

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (abs >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (abs >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function formatFullNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString();
}

export function formatTrendPercent(trendValue) {
  if (!trendValue || isNaN(trendValue)) return '0%';
  const pct = trendValue * 100;
  const sign = pct > 0 ? '+' : '';
  if (Math.abs(pct) < 0.01) {
    return `${sign}${pct.toFixed(3)}%`;
  }
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatRelativeDate(dateString) {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays <= 0) {
      if (diffHours <= 0) {
        if (diffMins <= 0) return 'Just now';
        return `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  } catch {
    return 'Recently';
  }
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getRatingColor(rating) {
  if (!rating || rating === 0) return 'text-slate-400';
  if (rating >= 4.5) return 'text-amber-400';
  if (rating >= 3.8) return 'text-emerald-400';
  if (rating >= 3.0) return 'text-blue-400';
  return 'text-rose-400';
}
