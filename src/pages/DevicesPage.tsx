import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Cpu, 
  Wifi, 
  Battery, 
  Sliders, 
  Trash2, 
  ExternalLink, 
  Radio, 
  RefreshCw,
  Info,
  Layers
} from 'lucide-react';
import { store } from '../services/store';
import { Device } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddDeviceModal } from '../components/devices/AddDeviceModal';
import { DeviceControlModal } from '../components/devices/DeviceControlModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface DevicesPageProps {
  onNavigate: (section: string) => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const DevicesPage: React.FC<DevicesPageProps> = ({ onNavigate, onSelectDevice }) => {
  const [devices, setDevices] = useState<Device[]>(store.getDevices());
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'esp32'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [controlDevice, setControlDevice] = useState<Device | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setDevices(store.getDevices());
    });
    return unsub;
  }, []);

  const filteredDevices = devices.filter((d) => {
    if (filter === 'online') return d.status === 'online';
    if (filter === 'offline') return d.status === 'offline';
    if (filter === 'esp32') return d.type.startsWith('ESP32');
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Connected IoT Devices</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered microcontrollers, hardware capabilities, and actuator controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hardware Device</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All (${devices.length})` },
          { id: 'online', label: `Online (${devices.filter(d => d.status === 'online').length})` },
          { id: 'offline', label: `Offline (${devices.filter(d => d.status === 'offline').length})` },
          { id: 'esp32', label: `ESP32 Nodes (${devices.filter(d => d.type.startsWith('ESP32')).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
              filter === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No Matching Hardware</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No devices found matching filter "{filter}". Add a new ESP32 board or enable Demo Mode in the top navigation.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl"
          >
            Add First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevices.map((device) => {
            const isOnline = device.status === 'online';
            return (
              <div
                key={device.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-mono truncate">{device.name}</h3>
                        {device.isDemo && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span className="text-cyan-400 font-semibold">{device.type}</span>
                        <span>•</span>
                        <span>{device.ipAddress || 'DHCP (Awaiting)'}</span>
                      </div>
                    </div>
                    <StatusBadge status={device.status} />
                  </div>

                  {/* Hardware Specs & Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-[11px] font-mono mb-4">
                    <div className="text-center p-1.5 rounded-lg bg-slate-950/60">
                      <div className="text-slate-500 text-[9px] uppercase">Wi-Fi RSSI</div>
                      <div className="font-semibold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                        <Wifi className="w-3 h-3 text-cyan-400" />
                        <span>{device.wifiRssi ? `${device.wifiRssi} dBm` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="text-center p-1.5 rounded-lg bg-slate-950/60">
                      <div className="text-slate-500 text-[9px] uppercase">Battery</div>
                      <div className="font-semibold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        <span>{device.battery ?? 100}%</span>
                      </div>
                    </div>

                    <div className="text-center p-1.5 rounded-lg bg-slate-950/60">
                      <div className="text-slate-500 text-[9px] uppercase">Sensors</div>
                      <div className="font-semibold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                        <Layers className="w-3 h-3 text-purple-400" />
                        <span>{device.sensors.length} Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Sensor Live Values */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                      Telemetry Channels
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {device.sensors.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                        >
                          <span className="text-slate-500">{s.name.split(' ')[0]}:</span>
                          <span className="font-bold text-white">
                            {s.type === 'temperature' ? store.formatTemp(s.currentValue) : `${s.currentValue}${s.unit}`}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setControlDevice(device)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hardware Control</span>
                  </button>

                  <button
                    onClick={() => setDeviceToDelete(device)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/60 transition-colors"
                    title="Remove device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Control Modal */}
      <DeviceControlModal
        device={controlDevice}
        isOpen={!!controlDevice}
        onClose={() => setControlDevice(null)}
      />

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deviceToDelete}
        title="Unlink IoT Hardware Device?"
        message={`Are you sure you want to remove "${deviceToDelete?.name}"? All associated historical telemetry points and sensor configurations will be permanently purged from your account.`}
        confirmLabel="Yes, Delete Device"
        onConfirm={() => {
          if (deviceToDelete) {
            store.deleteDevice(deviceToDelete.id);
            setDeviceToDelete(null);
          }
        }}
        onCancel={() => setDeviceToDelete(null)}
      />
    </div>
  );
};
