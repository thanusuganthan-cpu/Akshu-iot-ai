import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Lock, 
  Cpu, 
  Check, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { store } from '../services/store';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(store.getUser());
  const [displayName, setDisplayName] = useState(user.displayName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setUser(store.getUser());
    });
    return unsub;
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateUser({ displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-cyan-400" />
          <span>Operator Profile & Credentials</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Identity, role permissions, and cryptographic security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl font-bold font-mono">
            {user.displayName.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{user.displayName}</h3>
            <span className="text-xs font-mono text-slate-400">{user.email}</span>
            <div className="mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                {user.role} Role
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono space-y-1.5">
            <div className="flex justify-between">
              <span>Account ID:</span>
              <span className="text-slate-300 font-bold">{user.uid}</span>
            </div>
            <div className="flex justify-between">
              <span>Authentication:</span>
              <span className="text-emerald-400 font-bold">Local Active</span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Edit Operator Details
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Email / Operator Handle</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Sandbox & Firestore Master Gate</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Device telemetry ingestion is gated strictly by hardware API tokens. User authentication and rule checks enforce row-level ownership across all Firestore collections.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors shadow-md flex items-center gap-1.5"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saved ? 'Updated' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
