import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Layers, 
  Clock, 
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { store } from '../services/store';
import { Device, TelemetryPoint, UserProfile } from '../types';

export const LiveSensorsPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(store.getDevices());
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(store.getTelemetry());
  const [user, setUser] = useState<UserProfile>(store.getUser());
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSensorType, setSelectedSensorType] = useState<string>('all');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setDevices(store.getDevices());
      setTelemetry(store.getTelemetry());
      setUser(store.getUser());
    });
    return unsub;
  }, []);

  // Filter telemetry points by range
  const sliceCount = timeRange === '1h' ? 8 : timeRange === '6h' ? 14 : timeRange === '24h' ? 24 : 50;
  const chartPoints = telemetry.slice(-sliceCount).map((p) => {
    const date = new Date(p.timestamp);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: p.temperature ?? 24.5,
      humidity: p.humidity ?? 52,
      airQuality: p.airQuality ?? 38,
      light: p.light ?? 420,
    };
  });

  const primaryDevice = devices[0];
  const allSensors = devices.flatMap((d) => d.sensors);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Live Sensor Dynamics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-channel telemetry streams with range analytics.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {(['1h', '6h', '24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                timeRange === r
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temp */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Temperature
            </span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">
              {store.formatTemp(chartPoints[chartPoints.length - 1]?.temperature ?? 24.5)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Range: -40° to 80°</span>
            <span className="text-emerald-400">Stable</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Humidity
            </span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">
              {chartPoints[chartPoints.length - 1]?.humidity ?? 52}%
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Target: 40% - 60%</span>
            <span className="text-emerald-400">Comfortable</span>
          </div>
        </div>

        {/* AQI */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Air Quality
            </span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">
              {chartPoints[chartPoints.length - 1]?.airQuality ?? 38} <span className="text-xs font-normal text-slate-400">AQI</span>
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Particulate: PM2.5</span>
            <span className="text-emerald-400">Good Quality</span>
          </div>
        </div>

        {/* Light */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ambient Light
            </span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white font-mono">
              {chartPoints[chartPoints.length - 1]?.light ?? 420} <span className="text-xs font-normal text-slate-400">lux</span>
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Daylight Illumination</span>
            <span className="text-yellow-400">Active</span>
          </div>
        </div>
      </div>

      {/* Main Environmental Dynamics Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Telemetry Trend Visualization ({timeRange})
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized multi-axis environmental traces
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" /> Temp
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2.5 h-0.5 bg-blue-400 rounded-full" /> Humidity
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" /> AQI
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="airQuality"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
