import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="font-semibold text-slate-200">{item.year}</p>
        <p className="text-cyan-400 font-mono text-sm mt-0.5">
          {item.releases} {item.releases === 1 ? 'version' : 'versions'} released
        </p>
      </div>
    );
  }
  return null;
}

export default function ReleaseTimelineChart({ cadenceData }) {
  if (!cadenceData || !cadenceData.releaseHistoryByYear) return null;

  const yearMap = cadenceData.releaseHistoryByYear;
  const years = Object.keys(yearMap).sort();

  if (years.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
        No release timeline history available
      </div>
    );
  }

  const data = years.map((y) => ({
    year: y,
    releases: yearMap[y],
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
          <XAxis
            dataKey="year"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="releases" fill="#06b6d4" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
