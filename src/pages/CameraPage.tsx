import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Maximize2, 
  Sliders, 
  Eye, 
  EyeOff, 
  Download, 
  Zap, 
  Check, 
  AlertCircle,
  X
} from 'lucide-react';
import { store } from '../services/store';
import { CameraConfig } from '../types';

export const CameraPage: React.FC = () => {
  const [cameras, setCameras] = useState<CameraConfig[]>(store.getCameras());
  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings form state
  const currentCam = cameras[activeCamIndex] || {
    id: 'cam_default',
    userId: 'operator_01',
    name: 'ESP32-CAM Stream',
    streamUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    status: 'online',
    resolution: 'SVGA (800x600)',
  };

  const [formName, setFormName] = useState(currentCam.name);
  const [formUrl, setFormUrl] = useState(currentCam.streamUrl);
  const [formRes, setFormRes] = useState(currentCam.resolution || 'SVGA (800x600)');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCameras(store.getCameras());
    });
    return unsub;
  }, []);

  const handleTakeSnapshot = () => {
    // Generate snapshot download
    setSnapshotCount(prev => prev + 1);
    const link = document.createElement('a');
    link.href = currentCam.streamUrl;
    link.target = '_blank';
    link.download = `akshu-camera-snapshot-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleFlash = async () => {
    const next = !flashActive;
    setFlashActive(next);
    if (currentCam.deviceId) {
      await store.sendDeviceCommand(currentCam.deviceId, 'flash_led' as any, next ? 1 : 0);
    }
  };

  const handleSaveSettings = () => {
    store.updateCamera(currentCam.id, {
      name: formName,
      streamUrl: formUrl,
      resolution: formRes,
    });
    setShowSettings(false);
  };

  const handleRefreshStream = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-cyan-400" />
            <span>ESP32-CAM Vision System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Low-latency MJPEG video stream, snapshot capture, and illumination control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              privacyMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{privacyMode ? 'Privacy Shield Active' : 'Privacy Mode'}</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stream Setup</span>
          </button>
        </div>
      </div>

      {/* Main Video Stage */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden relative group">
        {/* Stream / Image Surface */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {privacyMode ? (
            <div className="p-8 text-center space-y-3">
              <EyeOff className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300 font-mono">Stream Obfuscated by Privacy Mode</h4>
                <p className="text-xs text-slate-500">Video feed sensor blinders engaged. Telemetry continues logging.</p>
              </div>
            </div>
          ) : isRefreshing ? (
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Reconnecting to ESP32 stream...</span>
            </div>
          ) : (
            <img
              src={currentCam.streamUrl}
              alt="ESP32-CAM Stream"
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
          )}

          {/* OSD (On-Screen Display) Overlays */}
          {!privacyMode && (
            <>
              {/* Top Left OSD */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-bold">{currentCam.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400">{currentCam.resolution}</span>
              </div>

              {/* Top Right OSD */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300">
                <span>FPS: ~24</span>
                <span className="text-slate-600">|</span>
                <span>Latency: 42ms</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom Bar Controls */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeSnapshot}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Capture Snapshot</span>
            </button>

            <button
              onClick={handleToggleFlash}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                flashActive
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{flashActive ? 'Flash LED ON' : 'Flash LED'}</span>
            </button>

            <button
              onClick={handleRefreshStream}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Refresh Stream Connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Direct Endpoint: <code className="text-cyan-400 font-bold">{currentCam.streamUrl.slice(0, 32)}...</code>
          </div>
        </div>
      </div>

      {/* Stream Setup Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono">Configure Camera Stream</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold tracking-wider mb-1">Camera Label</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold tracking-wider mb-1">
                  MJPEG / Snapshot URL
                </label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="http://192.168.1.188:81/stream"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Provide your local ESP32-CAM MJPEG stream endpoint or reverse proxy URL.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold tracking-wider mb-1">Resolution</label>
                <select
                  value={formRes}
                  onChange={e => setFormRes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500"
                >
                  <option value="QVGA (320x240)">QVGA (320x240) - Low Latency</option>
                  <option value="VGA (640x480)">VGA (640x480) - Balanced</option>
                  <option value="SVGA (800x600)">SVGA (800x600) - High Quality</option>
                  <option value="UXGA (1600x1200)">UXGA (1600x1200) - Still Snapshots</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
