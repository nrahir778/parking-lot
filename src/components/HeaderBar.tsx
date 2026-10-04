import React from 'react';
import { ConnectionMode, ThemeMode } from '../types';
import {
  Usb,
  Bluetooth,
  Power,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  BellRing,
} from 'lucide-react';

interface HeaderBarProps {
  connectionMode: ConnectionMode;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onConnectUSB: () => void;
  onConnectBluetooth: () => void;
  onDisconnect: () => void;
  onOpenNotificationModal?: () => void;
  portLabel?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  connectionMode,
  theme,
  onToggleTheme,
  onConnectUSB,
  onConnectBluetooth,
  onDisconnect,
  onOpenNotificationModal,
  portLabel,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';
  const isConnecting = connectionMode === 'connecting';
  const isLight = theme === 'light';

  return (
    <header
      className={`w-full border-b px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
          : 'glass-panel border-slate-800/80 text-white'
      }`}
    >
      {/* Zone 1: Clean Brand & School Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <img
          src="/pwa-192x192.png"
          alt="Smart Parking"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-amber-400/50 shadow-md object-cover shrink-0"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight">
              Smart Parking
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              લાખાપર
            </span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-mono ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            શ્રી સરકારી માધ્યમિક શાળા લાખાપર
          </span>
        </div>
      </div>

      {/* Zone 2: System Status Indicator (Desktop/Tablet) */}
      <div
        className={`hidden md:flex items-center gap-2 text-xs font-mono ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
              : isConnecting
              ? 'bg-amber-400 animate-ping'
              : 'bg-slate-400'
          }`}
        />
        <span className="font-semibold">
          {connectionMode === 'connected_usb'
            ? `USB: ${portLabel || 'ARDUINO'}`
            : connectionMode === 'connected_bt'
            ? `BLUETOOTH: ${portLabel || 'HC-05'}`
            : isConnecting
            ? 'CONNECTING...'
            : 'DISCONNECTED'}
        </span>
      </div>

      {/* Zone 3: Essential Controls for End User */}
      <div className="flex items-center gap-2">
        {/* Notification Settings Button */}
        {onOpenNotificationModal && (
          <button
            onClick={onOpenNotificationModal}
            className={`p-2 rounded-xl border transition-colors flex items-center justify-center relative ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'glass-panel text-cyan-300 hover:text-white border-slate-700'
            }`}
            title="Notification Alerts & Permissions"
            aria-label="Notification settings"
          >
            <BellRing className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
          </button>
        )}

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'glass-panel text-amber-300 hover:text-white border-slate-700'
          }`}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle theme"
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
              isFullscreen
                ? 'bg-rose-600 text-white border-rose-400'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'glass-panel text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        {/* Connection Action Buttons */}
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/40 text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Connect Bluetooth (Primary for mobile app) */}
            <button
              onClick={onConnectBluetooth}
              disabled={isConnecting}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 whitespace-nowrap active:scale-95"
              title="Connect wirelessly via Bluetooth"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span>Connect Bluetooth</span>
            </button>

            {/* Connect USB Cable (Secondary for OTG / PC) */}
            <button
              onClick={onConnectUSB}
              disabled={isConnecting}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 whitespace-nowrap active:scale-95"
              title="Connect via USB Cable"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>USB</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
