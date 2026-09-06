import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Check, 
  Bell, 
  ShieldAlert, 
  Sliders, 
  Info,
  X
} from 'lucide-react';
import { store } from '../services/store';
import { AlertRule, Device, SensorType } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRule[]>(store.getAlerts());
  const [devices, setDevices] = useState<Device[]>(store.getDevices());
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('Critical Temperature Limit');
  const [sensorType, setSensorType] = useState<SensorType>('temperature');
  const [operator, setOperator] = useState<AlertRule['operator']>('>');
  const [threshold, setThreshold] = useState<number>(30);
  const [severity, setSeverity] = useState<AlertRule['severity']>('critical');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAlerts(store.getAlerts());
      setDevices(store.getDevices());
    });
    return unsub;
  }, []);

  const handleToggle = (id: string, current: boolean) => {
    store.updateAlert(id, { enabled: !current });
  };

  const handleDelete = (id: string) => {
    store.deleteAlert(id);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: AlertRule = {
      id: 'alt_' + Date.now().toString(36),
      userId: store.getUser().uid,
      name,
      deviceId: devices[0]?.id || '',
      sensorType,
      operator,
      threshold: Number(threshold),
      severity,
      enabled: true,
      channels: ['in_app'],
      createdAt: new Date().toISOString(),
    };
    store.addAlert(newAlert);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Threshold & Anomaly Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time threshold sentinels monitoring out-of-boundary sensor excursions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((rule) => {
          const isCritical = rule.severity === 'critical';
          const isWarning = rule.severity === 'warning';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.enabled
                  ? 'bg-slate-900/90 border-slate-800 shadow-lg'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono truncate">{rule.name}</h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isWarning
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(rule.id, rule.enabled)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      rule.enabled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {rule.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 my-3 font-mono text-xs">
                <span className="text-slate-500 text-[10px] block uppercase mb-0.5">Threshold Trigger</span>
                <span className="text-white font-bold">
                  {rule.sensorType} {rule.operator} {rule.threshold}
                  {rule.sensorType === 'temperature' ? '°C' : rule.sensorType === 'humidity' ? '%' : ''}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>In-app Notification: Active</span>
                <span className="text-slate-500">Auto-resolved</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono">Create Sentinel Alert</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Alert Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Sensor</label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value="temperature">Temperature (°C)</option>
                    <option value="humidity">Humidity (%)</option>
                    <option value="air_quality">Air Quality (AQI)</option>
                    <option value="light">Light (Lux)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Condition</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value=">">Exceeds (&gt;)</option>
                    <option value="<">Falls below (&lt;)</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Threshold</label>
                  <input
                    type="number"
                    step="0.5"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
