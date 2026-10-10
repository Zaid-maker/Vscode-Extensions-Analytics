import { Loader2 } from 'lucide-react';

// In-panel chart placeholder while the recharts chunk streams in
export default function ChartLoader() {
  return (
    <div className="w-full h-56 flex items-center justify-center rounded-lg bg-slate-950/40 border border-slate-800/60">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );
}
