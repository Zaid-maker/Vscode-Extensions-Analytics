// Modal navigation tabs row.
import { Layers, TrendingUp, Calendar, Shield } from 'lucide-react';

const DETAIL_TABS = [
  { id: 'overview', label: 'Analytics Overview', icon: Layers },
  { id: 'growth', label: 'Growth & Milestones', icon: TrendingUp },
  { id: 'releases', label: 'Release Cadence', icon: Calendar },
  { id: 'badges', label: 'README Badges', icon: Shield },
];

export default function ModalTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto">
      {DETAIL_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              active
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
