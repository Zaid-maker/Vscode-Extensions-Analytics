import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatNumber, formatFullNumber } from '../../utils/formatters';

const COLORS = ['#6366f1', '#06b6d4', '#10b981'];

function CustomTooltip({ active, payload, total }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="font-semibold text-slate-200">{item.name}</p>
        <p className="text-indigo-400 font-mono text-sm mt-0.5">
          {formatFullNumber(item.value)}
        </p>
        <p className="text-slate-400 text-[11px] mt-0.5">{pct}% of total activity</p>
      </div>
    );
  }
  return null;
}

export default function DistributionChart({ stats }) {
  if (!stats) return null;

  const data = [
    { name: 'Active Installs', value: stats.installs || 0 },
    { name: 'Updates Delivered', value: stats.updates || 0 },
    { name: 'Web Downloads', value: stats.downloads || 0 },
  ].filter((d) => d.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#0b0f17"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={(props) => <CustomTooltip {...props} total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Flow
          </span>
          <span className="text-base font-bold text-white font-mono">
            {formatNumber(total)}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
        {data.map((item, idx) => (
          <div key={item.name} className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-300 truncate max-w-[80px] text-[11px]">
                {item.name}
              </span>
            </div>
            <span className="font-mono font-medium text-slate-100">
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
