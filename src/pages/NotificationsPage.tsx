import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { store } from '../services/store';
import { AppNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(store.getNotifications());

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setNotifications(store.getNotifications());
    });
    return unsub;
  }, []);

  const handleMarkAllRead = () => {
    store.markAllNotificationsRead();
  };

  const handleClear = () => {
    store.clearNotifications();
  };

  const handleMarkRead = (id: string) => {
    store.markNotificationRead(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-purple-400" />
            <span>Event & Alert Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System warnings, critical threshold alarms, and hardware status updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No active notifications</p>
            <p className="text-xs text-slate-500 mt-1">
              Your hardware nodes and threshold monitors have reported no anomalies.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isCritical = notif.severity === 'critical';
            const isWarning = notif.severity === 'warning';

            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  !notif.read
                    ? isCritical
                      ? 'bg-rose-950/30 border-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                      : isWarning
                      ? 'bg-amber-950/30 border-amber-900/60'
                      : 'bg-slate-900 border-cyan-900/60'
                    : 'bg-slate-950/40 border-slate-900 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isWarning ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-mono">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-mono">
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      {notif.deviceId && <span>Node: {notif.deviceId}</span>}
                    </div>
                  </div>
                </div>

                {!notif.read && (
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold whitespace-nowrap self-center">
                    NEW
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
