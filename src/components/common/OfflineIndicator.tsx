import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-rose-900/90 text-rose-100 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-md border-b border-rose-700/80 shadow-lg">
      <WifiOff className="w-4 h-4 text-rose-300 animate-pulse shrink-0" />
      <span>You are currently offline. Displaying cached telemetry and local device storage.</span>
    </div>
  );
};
