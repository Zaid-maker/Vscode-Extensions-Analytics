import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatFullNumber } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="font-semibold text-slate-200">{item.label}</p>
        <p className="text-emerald-400 font-mono text-sm mt-0.5">
          {formatFullNumber(item.installs)} installs
        </p>
        {item.gain > 0 && (
          <p className="text-slate-400 text-[11px] mt-0.5">
            +{formatNumber(item.gain)} projected net gain
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function GrowthProjectionChart({ projections }) {
  if (!projections || projections.length === 0) return null;

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={projections}
          margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => formatNumber(v)}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="installs"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#growthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
