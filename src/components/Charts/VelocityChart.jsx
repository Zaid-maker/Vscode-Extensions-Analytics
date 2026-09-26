import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatTrendPercent } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="font-semibold text-slate-200">{item.period}</p>
        <p className="text-indigo-400 font-mono text-sm mt-0.5">
          {formatTrendPercent(item.rawValue)}
        </p>
        <p className="text-slate-400 text-[11px] mt-0.5">Marketplace Velocity Score</p>
      </div>
    );
  }
  return null;
}

export default function VelocityChart({ stats }) {
  if (!stats) return null;

  const data = [
    {
      period: 'Daily (24h)',
      value: (stats.trendingDaily || 0) * 100,
      rawValue: stats.trendingDaily || 0,
      color: '#38bdf8',
    },
    {
      period: 'Weekly (7d)',
      value: (stats.trendingWeekly || 0) * 100,
      rawValue: stats.trendingWeekly || 0,
      color: '#6366f1',
    },
    {
      period: 'Monthly (30d)',
      value: (stats.trendingMonthly || 0) * 100,
      rawValue: stats.trendingMonthly || 0,
      color: '#a855f7',
    },
  ];

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
          <XAxis
            dataKey="period"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
