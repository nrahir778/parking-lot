import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono font-medium shadow-xl border backdrop-blur-md transition-all ${
        !isOnline
          ? 'bg-amber-600/90 text-white border-amber-400/50 shadow-amber-900/30 animate-pulse'
          : 'bg-slate-900/80 text-emerald-400 border-slate-700/60 opacity-60 hover:opacity-100'
      }`}
      title={
        !isOnline
          ? 'Offline Mode Active: Running 100% from local cache'
          : 'Online: Service Worker caching active'
      }
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>100% Offline Mode (Cached)</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Offline Ready (PWA)</span>
        </>
      )}
    </div>
  );
};
