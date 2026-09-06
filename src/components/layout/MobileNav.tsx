import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Camera, 
  Sparkles, 
  Menu, 
  X, 
  Zap, 
  AlertTriangle, 
  History, 
  BarChart3, 
  Bell, 
  Settings, 
  User, 
  BookOpen,
  Activity
} from 'lucide-react';
import { store } from '../../services/store';

interface MobileNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeSection, onNavigate }) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const unreadCount = store.getUnreadNotificationCount();

  const handleSelect = (id: string) => {
    onNavigate(id);
    setShowMoreDrawer(false);
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around select-none">
        {/* Home / Dashboard */}
        <button
          onClick={() => handleSelect('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            activeSection === 'dashboard' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home"
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Devices */}
        <button
          onClick={() => handleSelect('devices')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            activeSection === 'devices' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Devices"
        >
          <Cpu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Devices</span>
        </button>

        {/* Camera */}
        <button
          onClick={() => handleSelect('camera')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
            activeSection === 'camera' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Camera"
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Camera</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => handleSelect('ai')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors relative ${
            activeSection === 'ai' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="AI Assistant"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-cyan-400" />
          <span className="text-[10px]">AI Core</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </button>

        {/* More Drawer Trigger */}
        <button
          onClick={() => setShowMoreDrawer(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors relative ${
            ['automations', 'alerts', 'history', 'analytics', 'notifications', 'settings', 'profile', 'help', 'sensors'].includes(activeSection)
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="More options"
        >
          <div className="relative">
            <Menu className="w-5 h-5 mb-0.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500" />
            )}
          </div>
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Slide-up "More" Drawer for Mobile */}
      {showMoreDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">AKSHU IoT Systems</span>
                <span className="text-xs text-slate-400 font-mono">Mobile Hub</span>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close drawer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button
                onClick={() => handleSelect('sensors')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'sensors'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Live Sensors</span>
              </button>

              <button
                onClick={() => handleSelect('automations')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'automations'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Automations</span>
              </button>

              <button
                onClick={() => handleSelect('alerts')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'alerts'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Alerts</span>
              </button>

              <button
                onClick={() => handleSelect('history')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'history'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <History className="w-4 h-4 text-blue-400" />
                <span>History & CSV</span>
              </button>

              <button
                onClick={() => handleSelect('analytics')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'analytics'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => handleSelect('notifications')}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelect('settings')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'settings'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => handleSelect('profile')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                  activeSection === 'profile'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile</span>
              </button>
            </div>

            <button
              onClick={() => handleSelect('help')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>ESP32 C++ Sketch & API Documentation</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
