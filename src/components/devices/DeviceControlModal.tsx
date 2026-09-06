import React, { useState } from 'react';
import { 
  X, 
  Power, 
  Sliders, 
  RotateCw, 
  Volume2, 
  Sun, 
  Wind, 
  Compass, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Device } from '../../types';
import { store } from '../../services/store';

interface DeviceControlModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceControlModal: React.FC<DeviceControlModalProps> = ({ device, isOpen, onClose }) => {
  const [relayState, setRelayState] = useState<boolean>(false);
  const [fanSpeed, setFanSpeed] = useState<number>(50);
  const [fanActive, setFanActive] = useState<boolean>(false);
  const [lightBrightness, setLightBrightness] = useState<number>(75);
  const [lightActive, setLightActive] = useState<boolean>(false);
  const [servoAngle, setServoAngle] = useState<number>(90);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !device) return null;

  const caps = device.capabilities || [];
  const hasRelay = caps.includes('relay') || caps.includes('switch');
  const hasFan = caps.includes('fan') || caps.includes('relay');
  const hasLight = caps.includes('light') || caps.includes('flash_led') || caps.includes('relay');
  const hasBuzzer = caps.includes('buzzer') || caps.includes('audio');
  const hasServo = caps.includes('servo');

  const executeCommand = async (type: any, val: any, label: string) => {
    setIsSending(true);
    setActionFeedback(null);
    const result = await store.sendDeviceCommand(device.id, type, val);
    setIsSending(false);
    setActionFeedback(result.message);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleToggleRelay = () => {
    const next = !relayState;
    setRelayState(next);
    executeCommand('relay_toggle', next ? 1 : 0, `Relay ${next ? 'ON' : 'OFF'}`);
  };

  const handleToggleFan = () => {
    const next = !fanActive;
    setFanActive(next);
    executeCommand('fan_control', next ? fanSpeed : 0, `Fan ${next ? 'ON' : 'OFF'}`);
  };

  const handleToggleLight = () => {
    const next = !lightActive;
    setLightActive(next);
    executeCommand('light_control', next ? lightBrightness : 0, `Light ${next ? 'ON' : 'OFF'}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white truncate max-w-xs">{device.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Hardware Control Panel • {device.type}
              </p>
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

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Relay Control */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Relay Switch Channel #1
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                relayState ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {relayState ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </span>
            </div>

            {hasRelay ? (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">High-power AC/DC switching circuit</p>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleToggleRelay}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    relayState
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {relayState ? 'Switch OFF' : 'Switch ON'}
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500 italic flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Not registered in device capabilities.</span>
              </div>
            )}
          </div>

          {/* Fan Speed / Exhaust Control */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Cooling / Exhaust Fan (PWM)
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleFan}
                disabled={!hasFan || isSending}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  fanActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {fanActive ? 'ACTIVE' : 'STANDBY'}
              </button>
            </div>

            {hasFan ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Fan Duty Cycle:</span>
                  <span className="font-mono text-cyan-300 font-bold">{fanSpeed}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={fanSpeed}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFanSpeed(v);
                    if (fanActive) executeCommand('fan_control', v, `Fan speed ${v}%`);
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500 italic flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Device has no registered fan actuator.</span>
              </div>
            )}
          </div>

          {/* Light / Illumination Control */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  LED / Luminaire Output
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleLight}
                disabled={!hasLight || isSending}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  lightActive ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {lightActive ? 'ILLUMINATING' : 'OFF'}
              </button>
            </div>

            {hasLight ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Brightness:</span>
                  <span className="font-mono text-yellow-300 font-bold">{lightBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={lightBrightness}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLightBrightness(v);
                    if (lightActive) executeCommand('light_control', v, `Light ${v}%`);
                  }}
                  className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500 italic flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Device has no registered light actuator.</span>
              </div>
            )}
          </div>

          {/* Buzzer / Audio Alarm Trigger */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Piezo Buzzer
                </span>
              </div>
              <button
                type="button"
                disabled={!hasBuzzer || isSending}
                onClick={() => executeCommand('buzzer', 1, 'Audible Beep (500ms)')}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-medium transition-colors disabled:opacity-40"
              >
                Trigger Beep
              </button>
            </div>
          </div>

          {/* Microcontroller Remote Restart */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-xs font-semibold text-rose-300">Remote Soft Reboot</span>
                <p className="text-[10px] text-slate-400">Triggers ESP.restart() over REST API</p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSending}
              onClick={() => executeCommand('restart', true, 'ESP32 Soft Reboot')}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold border border-rose-700/60 transition-colors"
            >
              Reboot ESP32
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Controls
          </button>
        </div>
      </div>
    </div>
  );
};
