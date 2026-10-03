import React from 'react';
import { ConnectionMode, ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Usb,
  Bluetooth,
  Power,
  Download,
  Code,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Smartphone,
} from 'lucide-react';

interface HeaderBarProps {
  connectionMode: ConnectionMode;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onConnectUSB: () => void;
  onConnectBluetooth: () => void;
  onDisconnect: () => void;
  onExportSingleFileHtml: () => void;
  onOpenArduinoGuide: () => void;
  onOpenApkModal?: () => void;
  isBrowserSupported: boolean;
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
  onExportSingleFileHtml,
  onOpenArduinoGuide,
  onOpenApkModal,
  portLabel,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';
  const isConnecting = connectionMode === 'connecting';
  const isLight = theme === 'light';

  return (
    <header
      className={`w-full border-b px-4 md:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4 sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
          : 'glass-panel border-slate-800/80 text-white'
      }`}
    >
      {/* Zone 1: Brand Wordmark with Custom School App Icon */}
      <div className="flex items-center gap-3">
        <img
          src="/pwa-192x192.png"
          alt="Smart Parking Logo"
          className="w-10 h-10 rounded-xl border border-amber-400/50 shadow-md object-cover shrink-0"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight">
              Smart Parking
            </span>
            <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
              શાળા લાખાપર
            </span>
          </div>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            શ્રી સરકારી માધ્યમિક શાળા લાખાપર · 100% Offline APK
          </span>
        </div>
      </div>

      {/* Zone 2: System Status Indicator */}
      <div
        className={`hidden lg:flex items-center gap-3 text-xs font-mono ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
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
              ? `USB LIVE: ${portLabel || 'ARDUINO UNO'}`
              : connectionMode === 'connected_bt'
              ? `BLUETOOTH LIVE: ${portLabel || 'HC-05'}`
              : isConnecting
              ? 'CONNECTING...'
              : 'OFFLINE / AWAITING HARDWARE'}
          </span>
        </div>
        <span aria-hidden="true" className="opacity-40">·</span>
        <span>REAL HARDWARE ONLY</span>
        <span aria-hidden="true" className="opacity-40">·</span>
        <span>9600 BAUD</span>
      </div>

      {/* Zone 3: Primary Action Controls */}
      <div className="flex items-center flex-wrap gap-2">
        {/* PWA Install Button (Chromium / iOS / Android) */}
        <PWAInstallButton onOpenApkModal={onOpenApkModal} isLightMode={isLight} />

        {/* Native Android APK Build & GitHub Actions Guide Button */}
        <button
          onClick={onOpenApkModal}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-xs ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'glass-panel text-cyan-300 hover:text-white border-cyan-500/30'
          }`}
          title="Build & Download Native Android APK using GitHub Actions"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Build APK</span>
        </button>

        {/* Theme Switcher Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'glass-panel text-amber-300 hover:text-white border-slate-700'
          }`}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Arduino Firmware & Wiring Guide Button */}
        <button
          onClick={onOpenArduinoGuide}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap border ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'glass-panel text-cyan-300 hover:text-white border-cyan-500/30 hover:border-cyan-500/50'
          }`}
          title="View Arduino Uno code (.ino), HC-05 wiring diagram, and Windows 11 setup"
        >
          <Code className="w-3.5 h-3.5 text-cyan-500" />
          <span>Code &amp; Wiring</span>
        </button>

        {/* Connect / Disconnect Buttons */}
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/40 text-xs font-medium font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        ) : (
          <>
            {/* Connect USB Button */}
            <button
              onClick={onConnectUSB}
              disabled={isConnecting}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 whitespace-nowrap"
              title="Connect via USB Serial Cable (9600 baud)"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>Connect USB</span>
            </button>

            {/* Connect HC-05 Bluetooth Button */}
            <button
              onClick={onConnectBluetooth}
              disabled={isConnecting}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 whitespace-nowrap"
              title="Connect wirelessly via HC-05 Bluetooth module"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span>Connect HC-05</span>
            </button>
          </>
        )}

        {/* Full Screen Toggle Button */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-xs ${
              isFullscreen
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400'
                : isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400/50'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'View Parking Lot in Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>
        )}

        {/* Download Standalone Single-File HTML */}
        <button
          onClick={onExportSingleFileHtml}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap border ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'glass-panel text-slate-300 hover:text-white border-slate-700'
          }`}
          title="Download as 100% self-contained single-file HTML to run offline"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Export HTML</span>
        </button>
      </div>
    </header>
  );
};

