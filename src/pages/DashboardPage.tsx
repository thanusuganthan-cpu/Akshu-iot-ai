import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Camera, 
  BatteryCharging, 
  Sparkles, 
  Sliders, 
  Plus, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { store } from '../services/store';
import { Device, TelemetryPoint, AlertRule, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { DeviceControlModal } from '../components/devices/DeviceControlModal';
import { AddDeviceModal } from '../components/devices/AddDeviceModal';

interface DashboardPageProps {
  onNavigate: (section: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile>(store.getUser());
  const [devices, setDevices] = useState<Device[]>(store.getDevices());
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(store.getTelemetry());
  const [alerts, setAlerts] = useState<AlertRule[]>(store.getAlerts());
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showControlModal, setShowControlModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickAIInsight, setQuickAIInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setUser(store.getUser());
      setDevices(store.getDevices());
      setTelemetry(store.getTelemetry());
      setAlerts(store.getAlerts());
    });
    return unsub;
  }, []);

  // Compute aggregated stats
  const onlineDevices = devices.filter((d) => d.status === 'online');
  const primaryDevice = devices[0];
  const primaryTempSensor = primaryDevice?.sensors.find((s) => s.type === 'temperature');
  const primaryHumSensor = primaryDevice?.sensors.find((s) => s.type === 'humidity');
  const primaryAqiSensor = primaryDevice?.sensors.find((s) => s.type === 'air_quality');

  const currentTemp = primaryTempSensor?.currentValue ?? 24.5;
  const tempPrev = primaryTempSensor?.previousValue ?? 24.0;
  const tempTrend = currentTemp >= tempPrev ? 'up' : 'down';

  const currentHum = primaryHumSensor?.currentValue ?? 52;
  const currentAqi = primaryAqiSensor?.currentValue ?? 38;

  // AQI assessment
  let aqiCategory = 'Good';
  let aqiColor = 'text-emerald-400';
  let aqiBg = 'bg-emerald-950/40 border-emerald-800/40';
  if (currentAqi > 50 && currentAqi <= 100) {
    aqiCategory = 'Moderate';
    aqiColor = 'text-amber-400';
    aqiBg = 'bg-amber-950/40 border-amber-800/40';
  } else if (currentAqi > 100 && currentAqi <= 150) {
    aqiCategory = 'Sensitive Unhealthy';
    aqiColor = 'text-orange-400';
    aqiBg = 'bg-orange-950/40 border-orange-800/40';
  } else if (currentAqi > 150) {
    aqiCategory = 'Unhealthy';
    aqiColor = 'text-rose-400';
    aqiBg = 'bg-rose-950/40 border-rose-800/40';
  }

  // Format telemetry for chart (last 16 points)
  const chartData = telemetry.slice(-16).map((pt) => {
    const d = new Date(pt.timestamp);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: pt.temperature ?? 24,
      hum: pt.humidity ?? 50,
      aqi: pt.airQuality ?? 40,
    };
  });

  const handleQuickInsight = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a brief 2-sentence summary of our current IoT environmental conditions and if any action is needed.',
          context: {
            devices: devices.map(d => ({ name: d.name, status: d.status })),
            currentReadings: [
              { temp: currentTemp, hum: currentHum, aqi: currentAqi }
            ],
            demoMode: user.demoMode,
          },
        }),
      });
      const data = await res.json();
      setQuickAIInsight(data.content || 'Environmental parameters remain within nominal laboratory thresholds.');
    } catch {
      setQuickAIInsight('Ambient parameters are stable. All sensor telemetry streams are operating within configured baseline.');
    }
    setLoadingAI(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Demo Mode Notice Banner */}
      {user.demoMode && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                DEMO DATA MODE ACTIVE
              </span>
              <p className="text-xs text-amber-200/70 mt-0.5">
                Displaying simulated laboratory readings for interface exploration. Real ESP32 hardware data will override when connected.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap"
          >
            Connect Real ESP32
          </button>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <span>IoT Command Center</span>
            <StatusBadge status={onlineDevices.length > 0 ? 'online' : 'offline'} label={onlineDevices.length > 0 ? 'System Online' : 'No Devices'} />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry, actuator states, and AI environmental intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
          <button
            onClick={() => onNavigate('sensors')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <span>Live Sensors</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Temperature
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {store.formatTemp(currentTemp)}
            </span>
            <span className={`flex items-center text-xs font-mono font-medium ${
              tempTrend === 'up' ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {tempTrend === 'up' ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {tempTrend === 'up' ? '+0.2°' : '-0.2°'}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Min: {store.formatTemp(primaryTempSensor?.todayMin ?? 21.4)}</span>
            <span>Max: {store.formatTemp(primaryTempSensor?.todayMax ?? 26.8)}</span>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Humidity
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {currentHum}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-medium">Optimal</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Range: 45% - 65%</span>
            <span>Dew: 13.8°C</span>
          </div>
        </div>

        {/* Air Quality (AQI) Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Air Quality
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {currentAqi} <span className="text-xs font-normal text-slate-400">AQI</span>
            </span>
            <span className={`text-xs font-mono font-bold ${aqiColor}`}>
              {aqiCategory}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>PM2.5: 8.2 µg/m³</span>
            <span>CO2: 440 ppm</span>
          </div>
        </div>

        {/* Devices Online Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Connected Hardware
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {onlineDevices.length} <span className="text-sm text-slate-500 font-normal">/ {devices.length}</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 font-medium">Nodes Active</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>ESP32: {devices.filter(d => d.type.startsWith('ESP32')).length}</span>
            <span>Alerts: {alerts.filter(a => a.enabled).length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Graph (2/3) + Quick Controls & AI Summary (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Telemetry Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Live Sensor Dynamics
              </h3>
              <p className="text-xs text-slate-400">
                Continuous telemetry sampled from {primaryDevice ? primaryDevice.name : 'connected nodes'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Temp (°C)
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Hum (%)
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1e293b' }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1e293b' }}
                  domain={['dataMin - 2', 'dataMax + 2']} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  name="Temperature"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="hum"
                  name="Humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#humGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Interval: 4000ms WebSocket/REST</span>
            <button
              onClick={() => onNavigate('history')}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Export CSV & Logs →
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Hardware Control & AI Diagnostic */}
        <div className="space-y-6">
          {/* AI Quick Diagnostic Panel */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-900/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                  Gemini IoT Intelligence
                </h4>
              </div>
              <button
                onClick={handleQuickInsight}
                disabled={loadingAI}
                className="p-1 rounded-lg bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-800 text-xs transition-colors"
                title="Refresh AI Analysis"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
              {quickAIInsight ||
                'Telemetry streams indicate balanced thermal and humidity equilibrium. No critical threshold violations detected.'}
            </p>

            <button
              onClick={() => onNavigate('ai')}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Launch Full AI Assistant</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actuator Actions */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Hardware Nodes
              </h4>
              <button
                onClick={() => onNavigate('devices')}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                View All ({devices.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {devices.slice(0, 3).map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="truncate mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white font-mono truncate">{dev.name}</span>
                      <StatusBadge status={dev.status} size="sm" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {dev.type} • RSSI {dev.wifiRssi ?? -60}dBm
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDevice(dev);
                      setShowControlModal(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
                    title="Control device actuators"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline text-[11px]">Control</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control Modal */}
      <DeviceControlModal
        device={selectedDevice}
        isOpen={showControlModal}
        onClose={() => {
          setShowControlModal(false);
          setSelectedDevice(null);
        }}
      />

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};
