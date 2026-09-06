import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Activity, 
  Camera, 
  Sparkles, 
  Zap, 
  AlertTriangle, 
  History, 
  BarChart3, 
  Bell, 
  Settings, 
  User, 
  BookOpen 
} from 'lucide-react';
import { store } from '../../services/store';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate }) => {
  const devices = store.getDevices();
  const unreadAlerts = store.getUnreadNotificationCount();
  const activeAlertsCount = store.getAlerts().filter(a => a.enabled).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Cpu, badge: devices.length > 0 ? String(devices.length) : undefined },
    { id: 'sensors', label: 'Live Sensors', icon: Activity },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, highlight: true },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? String(activeAlertsCount) : undefined },
    { id: 'history', label: 'History & Logs', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadAlerts > 0 ? String(unreadAlerts) : undefined, badgeColor: 'bg-rose-500' },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'help', label: 'Help & Docs', icon: BookOpen },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-950/70 border-r border-slate-800/80 shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
          Telemetry & Control
        </div>

        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : item.highlight
                      ? 'text-cyan-400 group-hover:text-cyan-300'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
          Automation & Insights
        </div>

        {navItems.slice(5, 10).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
          System & Support
        </div>

        {navItems.slice(10).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hardware Status Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-300">ESP32 REST Gateway</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          POST /api/devices/:id/telemetry
        </p>
      </div>
    </aside>
  );
};
