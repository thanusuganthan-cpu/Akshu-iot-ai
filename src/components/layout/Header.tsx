import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Cpu, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  ChevronDown, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { store } from '../../services/store';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { UserProfile, NotificationItem } from '../../types';

interface HeaderProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
  const [user, setUser] = useState<UserProfile>(store.getUser());
  const [notifications, setNotifications] = useState<NotificationItem[]>(store.getNotifications());
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setUser(store.getUser());
      setNotifications(store.getNotifications());
    });
    return unsub;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isDemo = user.demoMode;

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & System State */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-colors">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-mono">
                AKSHU <span className="text-cyan-400">IoT AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 font-sans tracking-wide">
              Connect. Monitor. Understand. Control.
            </p>
          </div>
        </button>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Demo Mode Toggle Pill */}
        <button
          onClick={() => store.toggleDemoMode()}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
            isDemo
              ? 'bg-amber-950/40 text-amber-300 border-amber-600/50 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:bg-amber-950/60'
              : 'bg-cyan-950/30 text-cyan-300 border-cyan-700/50 hover:bg-cyan-950/50'
          }`}
          title={isDemo ? 'Switch to Real Device Mode' : 'Switch to Demo Mode'}
        >
          <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'}`} />
          <span className="hidden sm:inline">{isDemo ? 'DEMO DATA' : 'REAL HARDWARE'}</span>
          <span className="sm:hidden">{isDemo ? 'DEMO' : 'LIVE'}</span>
        </button>

        {/* PWA Install */}
        <PWAInstallButton />

        {/* AI Quick Launch */}
        <button
          onClick={() => onNavigate('ai')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeSection === 'ai'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Assistant</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">System Alerts & Logs</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded-full font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => store.markAllNotificationsAsRead()}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setShowNotifMenu(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active alerts or events recorded.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        store.markNotificationAsRead(n.id);
                        onNavigate('notifications');
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 text-left hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold ${
                          n.severity === 'critical' ? 'text-rose-400' : n.severity === 'warning' ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Settings Quick Access */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'O'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <span>Profile & Account</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <span>System Settings</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('help');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <span>ESP32 Sketch & Docs</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
