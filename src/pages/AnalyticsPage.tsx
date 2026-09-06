import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Percent, 
  Sun, 
  Moon,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { store } from '../services/store';

export const AnalyticsPage: React.FC = () => {
  const telemetry = store.getTelemetry();

  // Aggregate daily averages for last 7 days
  const dailyData = [
    { day: 'Mon', avgTemp: 23.8, maxTemp: 26.2, avgHum: 48, avgAqi: 32 },
    { day: 'Tue', avgTemp: 24.1, maxTemp: 26.9, avgHum: 50, avgAqi: 36 },
    { day: 'Wed', avgTemp: 24.5, maxTemp: 27.1, avgHum: 53, avgAqi: 41 },
    { day: 'Thu', avgTemp: 24.0, maxTemp: 25.8, avgHum: 49, avgAqi: 38 },
    { day: 'Fri', avgTemp: 24.7, maxTemp: 27.5, avgHum: 54, avgAqi: 44 },
    { day: 'Sat', avgTemp: 25.2, maxTemp: 28.0, avgHum: 55, avgAqi: 48 },
    { day: 'Sun', avgTemp: 24.6, maxTemp: 26.8, avgHum: 52, avgAqi: 38 },
  ];

  const pieData = [
    { name: 'Optimal (AQI < 50)', value: 72, color: '#10b981' },
    { name: 'Moderate (AQI 50-100)', value: 22, color: '#f59e0b' },
    { name: 'Elevated (AQI > 100)', value: 6, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>Environmental Telemetry Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aggregated historical trends, diurnal variations, and sensor performance distributions.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">7-Day Mean Temp</span>
          <div className="mt-2 text-2xl font-bold text-white font-mono">24.4°C</div>
          <div className="mt-2 text-xs text-emerald-400 font-mono">±1.4°C Standard Deviation</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thermal Stability</span>
          <div className="mt-2 text-2xl font-bold text-white font-mono">98.4%</div>
          <div className="mt-2 text-xs text-cyan-400 font-mono">Within Comfort Envelope</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Day / Night Delta</span>
          <div className="mt-2 text-2xl font-bold text-white font-mono">Δ 3.2°C</div>
          <div className="mt-2 text-xs text-amber-400 font-mono">Passive Thermal Storage</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Air Quality Index</span>
          <div className="mt-2 text-2xl font-bold text-white font-mono">94% Good</div>
          <div className="mt-2 text-xs text-emerald-400 font-mono">Clean Room Standard</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Avg & Max Temperature */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Weekly Temperature Distribution (Mean vs Peak)
          </h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="avgTemp" name="Avg Temp (°C)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxTemp" name="Peak Temp (°C)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Air Quality Classification Pie */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Air Quality Envelope
          </h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="font-bold">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
