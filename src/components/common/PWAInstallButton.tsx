import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  if (isInstalled) return null;

  if (!isInstallable && !isIOS) return null;

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
          title="Install AKSHU IoT as a standalone PWA"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSPrompt(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
          title="Add to iOS Home Screen"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative animate-in slide-in-from-bottom-4">
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-base font-semibold text-slate-100 mb-2">Install on iOS</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Install AKSHU IoT AI to your iPhone or iPad home screen for standalone fullscreen monitoring:
            </p>

            <ol className="text-xs text-slate-300 space-y-2.5 mb-5">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Tap the <Share className="w-3.5 h-3.5 inline text-cyan-400" /> Share button in Safari toolbar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" /></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Tap <strong className="text-white">Add</strong> in the top right</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
