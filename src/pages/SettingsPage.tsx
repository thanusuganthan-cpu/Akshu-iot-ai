import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Thermometer, 
  Clock, 
  Volume2, 
  RotateCcw, 
  Database, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Cpu 
} from 'lucide-react';
import { store } from '../services/store';
import { UserProfile } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(store.getUser());
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>(user.tempUnit);
  const [refreshInterval, setRefreshInterval] = useState<number>(user.refreshInterval || 4000);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(user.soundAlerts || true);
  const [demoMode, setDemoMode] = useState<boolean>(user.demoMode);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      const u = store.getUser();
      setUser(u);
      setTempUnit(u.tempUnit);
      setRefreshInterval(u.refreshInterval || 4000);
      setSoundEnabled(u.soundAlerts || true);
      setDemoMode(u.demoMode);
    });
    return unsub;
  }, []);

  const handleSaveSettings = () => {
    store.updateUser({
      tempUnit,
      refreshInterval,
      soundAlerts: soundEnabled,
      demoMode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(`Connected: ${data.status.toUpperCase()} (${data.engine})`);
    } catch {
      setHealthStatus('Local dev fallback mode');
    }
    setIsCheckingHealth(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-slate-300" />
            <span>Platform Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global telemetry units, polling cadence, and hardware gateway parameters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Check className="w-4 h-4" />}
          <span>{savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environmental Display Units */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 text-white font-mono text-xs font-bold uppercase tracking-wider">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <span>Measurement Units</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs text-slate-400">Temperature Scale</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTempUnit('celsius')}
                className={`py-3 rounded-xl border font-mono text-xs font-bold transition-all ${
                  tempUnit === 'celsius'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('fahrenheit')}
                className={`py-3 rounded-xl border font-mono text-xs font-bold transition-all ${
                  tempUnit === 'fahrenheit'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>
        </div>

        {/* Polling Cadence */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 text-white font-mono text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Telemetry Ingestion Frequency</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Sampling Cycle:</span>
              <span className="font-mono text-cyan-400 font-bold">{refreshInterval / 1000}s</span>
            </div>
            <input
              type="range"
              min="2000"
              max="30000"
              step="1000"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2s (High Frequency)</span>
              <span>15s</span>
              <span>30s (Battery Eco)</span>
            </div>
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Simulated Demo Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setDemoMode(!demoMode)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
                demoMode
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {demoMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            When enabled, the system continuously generates realistic diurnal laboratory sensor variations. Disable when connecting real ESP32 boards.
          </p>
        </div>

        {/* Backend Gateway Health Test */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>REST Gateway Diagnostics</span>
            </div>
            <button
              type="button"
              onClick={handleCheckHealth}
              disabled={isCheckingHealth}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition-colors"
            >
              {isCheckingHealth ? 'Pinging...' : 'Ping Gateway'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            {healthStatus || 'Endpoint: GET /api/health (Click Ping Gateway to verify)'}
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
              Factory Reset / Clear Workspace
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently wipes all local state, registered ESP32 nodes, alert thresholds, and cached telemetry logs.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-rose-200 text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Clear Data
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Factory Reset App Storage?"
        message="This action cannot be undone. All custom devices, automation rules, and telemetry records will be wiped back to initial defaults."
        confirmLabel="Yes, Reset Everything"
        onConfirm={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
