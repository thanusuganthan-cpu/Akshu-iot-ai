import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Check, 
  Play, 
  Clock, 
  Sliders, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { store } from '../services/store';
import { AutomationRule, AutomationLog, Device, SensorType } from '../types';

export const AutomationsPage: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>(store.getAutomations());
  const [logs, setLogs] = useState<AutomationLog[]>(store.getAutomationLogs());
  const [devices, setDevices] = useState<Device[]>(store.getDevices());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('Exhaust Vent on High AQI');
  const [conditionDeviceId, setConditionDeviceId] = useState(devices[0]?.id || '');
  const [sensorType, setSensorType] = useState<SensorType>('air_quality');
  const [operator, setOperator] = useState<AutomationRule['operator']>('>');
  const [threshold, setThreshold] = useState<number>(75);
  const [targetDeviceId, setTargetDeviceId] = useState(devices[0]?.id || '');
  const [actionType, setActionType] = useState<AutomationRule['actionType']>('relay_toggle');
  const [actionValue, setActionValue] = useState<number>(1);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAutomations(store.getAutomations());
      setLogs(store.getAutomationLogs());
      setDevices(store.getDevices());
    });
    return unsub;
  }, []);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: AutomationRule = {
      id: 'auto_' + Date.now().toString(36),
      userId: store.getUser().uid,
      name,
      conditionDeviceId: conditionDeviceId || devices[0]?.id,
      conditionSensorType: sensorType,
      operator,
      threshold: Number(threshold),
      targetDeviceId: targetDeviceId || devices[0]?.id,
      actionType,
      actionValue,
      enabled: true,
      createdAt: new Date().toISOString(),
      executionCount: 0,
    };
    store.addAutomation(newRule);
    setShowAddModal(false);
  };

  const handleToggleRule = (id: string, currentState: boolean) => {
    store.updateAutomation(id, { enabled: !currentState });
  };

  const handleDeleteRule = (id: string) => {
    store.deleteAutomation(id);
  };

  const handleTestTrigger = async (rule: AutomationRule) => {
    await store.sendDeviceCommand(rule.targetDeviceId, rule.actionType as any, rule.actionValue);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Autonomous Hardware Triggers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic IF-THEN feedback loops linking sensor dynamics to actuator controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* Automations Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((rule) => {
          const conditionDev = devices.find((d) => d.id === rule.conditionDeviceId);
          const targetDev = devices.find((d) => d.id === rule.targetDeviceId);

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
                  <h3 className="text-sm font-bold text-white font-mono">{rule.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Triggered {rule.executionCount} times
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRule(rule.id, rule.enabled)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-colors ${
                      rule.enabled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logic Flow Diagram */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 my-3 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">IF TRIGGER</span>
                  <div className="text-cyan-300 font-semibold">
                    {rule.conditionSensorType} {rule.operator} {rule.threshold}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-slate-500 uppercase">THEN ACTION</span>
                  <div className="text-amber-400 font-semibold">
                    {rule.actionType} ({rule.actionValue})
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
                <span className="truncate">
                  Target: <strong className="text-slate-200">{targetDev?.name || 'Local Board'}</strong>
                </span>
                <button
                  onClick={() => handleTestTrigger(rule)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Test Fire</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Logs Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Recent Execution Audit Trail</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Rule Triggered</th>
                <th className="pb-3 font-semibold">Evaluated Reading</th>
                <th className="pb-3 font-semibold">Actuator Command</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No automated actuator executions logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 font-bold text-white">{log.ruleName}</td>
                    <td className="py-3 text-cyan-400 font-bold">{log.triggerValue}</td>
                    <td className="py-3 text-amber-300">{log.actionTaken}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Automation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono">Create IF-THEN Hardware Automation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans text-xs focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Sensor</label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value="temperature">Temperature</option>
                    <option value="humidity">Humidity</option>
                    <option value="air_quality">Air Quality</option>
                    <option value="light">Light Lux</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Condition</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value=">">Greater than (&gt;)</option>
                    <option value="<">Less than (&lt;)</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Actuator Action</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  >
                    <option value="fan_control">Exhaust Fan (PWM)</option>
                    <option value="relay_toggle">Relay Toggle (ON/OFF)</option>
                    <option value="light_control">Light Output (PWM)</option>
                    <option value="buzzer">Piezo Warning Buzzer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Action Value</label>
                  <input
                    type="number"
                    value={actionValue}
                    onChange={(e) => setActionValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
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
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
