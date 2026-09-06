import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Key, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Terminal, 
  Sparkles,
  Radio
} from 'lucide-react';
import { Device, DeviceType } from '../../types';
import { store } from '../../services/store';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated?: (device: Device) => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onDeviceCreated }) => {
  const [step, setStep] = useState<number>(1);
  const [deviceType, setDeviceType] = useState<DeviceType>('ESP32');
  const [deviceName, setDeviceName] = useState<string>('ESP32 Environmental Node');
  const [deviceKey, setDeviceKey] = useState<string>('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    'temperature',
    'humidity',
    'air_quality',
    'relay',
  ]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerateKey = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setDeviceKey(`akshu_live_${randomHex}`);
  };

  const handleNextFromStep2 = () => {
    if (!deviceKey) handleGenerateKey();
    setStep(3);
  };

  const toggleCapability = (cap: string) => {
    if (selectedCapabilities.includes(cap)) {
      setSelectedCapabilities(selectedCapabilities.filter(c => c !== cap));
    } else {
      setSelectedCapabilities([...selectedCapabilities, cap]);
    }
  };

  const handleCreateDevice = async () => {
    setIsSubmitting(true);
    const newId = `dev_${Date.now().toString(36)}`;
    const user = store.getUser();

    const sensors = [];
    if (selectedCapabilities.includes('temperature')) {
      sensors.push({
        id: `${newId}_temp`,
        deviceId: newId,
        name: 'Ambient Temperature',
        type: 'temperature' as const,
        unit: '°C',
        currentValue: 24.0,
        minRange: -40,
        maxRange: 80,
        status: 'active' as const,
        lastUpdated: new Date().toISOString(),
      });
    }
    if (selectedCapabilities.includes('humidity')) {
      sensors.push({
        id: `${newId}_hum`,
        deviceId: newId,
        name: 'Relative Humidity',
        type: 'humidity' as const,
        unit: '%',
        currentValue: 50.0,
        minRange: 0,
        maxRange: 100,
        status: 'active' as const,
        lastUpdated: new Date().toISOString(),
      });
    }
    if (selectedCapabilities.includes('air_quality')) {
      sensors.push({
        id: `${newId}_aqi`,
        deviceId: newId,
        name: 'Air Quality (AQI)',
        type: 'air_quality' as const,
        unit: 'AQI',
        currentValue: 35,
        minRange: 0,
        maxRange: 500,
        status: 'active' as const,
        lastUpdated: new Date().toISOString(),
      });
    }

    const newDevice: Device = {
      id: newId,
      userId: user.uid,
      name: deviceName,
      type: deviceType,
      status: 'offline', // Genuine: offline until real heartbeat
      deviceKey,
      capabilities: selectedCapabilities,
      sensors,
      battery: 100,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    try {
      // POST to backend
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deviceName,
          type: deviceType,
          capabilities: selectedCapabilities,
        }),
      });
    } catch {
      // Continue with store
    }

    store.addDevice(newDevice);
    if (onDeviceCreated) onDeviceCreated(newDevice);
    setIsSubmitting(false);
    onClose();
  };

  const sampleCurl = `curl -X POST "${window.location.origin}/api/devices/YOUR_DEVICE_ID/telemetry" \\
  -H "Content-Type: application/json" \\
  -H "x-device-key: ${deviceKey || 'YOUR_DEVICE_KEY'}" \\
  -d '{"temperature": 24.6, "humidity": 52.1, "airQuality": 38, "battery": 95}'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add IoT Hardware Device</h3>
              <p className="text-xs text-slate-400">Step {step} of 4: Setup & Registration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6">
          {/* STEP 1: Select Type & Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Microcontroller Architecture
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(['ESP32', 'ESP32-CAM', 'ESP32-S3', 'ESP8266', 'CUSTOM'] as DeviceType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDeviceType(t)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        deviceType === t
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono">{t}</span>
                        {deviceType === t && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {t === 'ESP32-CAM' ? 'Camera & Wi-Fi' : t === 'ESP8266' ? 'Legacy 2.4GHz' : 'Wi-Fi + Bluetooth'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Device Name / Location
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Living Room Node, Greenhouse ESP32"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Configure Capabilities */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Attached Sensors & Actuators
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Check which peripherals are wired to your ESP32 board.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'temperature', label: 'Temperature (DHT22/BME280)' },
                    { id: 'humidity', label: 'Relative Humidity' },
                    { id: 'air_quality', label: 'Air Quality (MQ-135/PMS5003)' },
                    { id: 'relay', label: 'Relay Switch / Mains Control' },
                    { id: 'fan', label: 'Cooling Fan (PWM Control)' },
                    { id: 'light', label: 'Light Sensor (LDR/BH1750)' },
                    { id: 'buzzer', label: 'Piezo Buzzer / Alarm' },
                    { id: 'servo', label: 'Micro Servo Motor (SG90)' },
                  ].map((cap) => {
                    const isChecked = selectedCapabilities.includes(cap.id);
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() => toggleCapability(cap.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                          isChecked
                            ? 'bg-cyan-950/40 text-cyan-200 border-cyan-600/60'
                            : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{cap.label}</span>
                        {isChecked ? (
                          <div className="w-4 h-4 rounded bg-cyan-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Generate Token */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Key className="w-4 h-4" />
                  <span>Hardware Authentication Token</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This secure device key authenticates telemetry packets from your ESP32. Keep it safe in your firmware.
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={deviceKey}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 font-mono text-xs text-cyan-400 border border-cyan-900/60 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(deviceKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Test Ingestion via Terminal / cURL
                </label>
                <div className="relative">
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    {sampleCurl}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleCurl);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs"
                    title="Copy cURL"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Device Name:</span>
                  <span className="text-xs font-bold text-white font-mono">{deviceName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Architecture:</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">{deviceType}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Capabilities:</span>
                  <span className="text-xs text-slate-300 font-mono">{selectedCapabilities.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Initial State:</span>
                  <span className="text-xs text-amber-400 font-mono">Offline (Awaiting first packet)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0 animate-pulse" />
                <p>
                  Once created, flash the provided Arduino C++ sketch to your board. As soon as your device boots, it will send a heartbeat and transition to <strong>ONLINE</strong> automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2) handleNextFromStep2();
                else setStep(step + 1);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateDevice}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.3)] disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
