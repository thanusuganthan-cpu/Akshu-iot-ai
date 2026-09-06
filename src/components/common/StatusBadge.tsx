import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'connecting' | 'error' | 'active' | 'warning' | 'critical';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const isOnline = status === 'online' || status === 'active';
  const isWarning = status === 'warning';
  const isCritical = status === 'critical' || status === 'error';
  const isConnecting = status === 'connecting';

  let dotColor = 'bg-slate-500';
  let badgeBg = 'bg-slate-800/60 text-slate-300 border-slate-700/60';

  if (isOnline) {
    dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    badgeBg = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
  } else if (isWarning) {
    dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
    badgeBg = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
  } else if (isCritical) {
    dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    badgeBg = 'bg-rose-950/40 text-rose-300 border-rose-800/40';
  } else if (isConnecting) {
    dotColor = 'bg-cyan-400 animate-pulse';
    badgeBg = 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40';
  }

  const displayText = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider font-medium border ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${badgeBg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="whitespace-nowrap">{displayText}</span>
    </span>
  );
};
