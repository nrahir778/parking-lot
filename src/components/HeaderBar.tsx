import React from 'react';
import { ConnectionMode } from '../types';
import {
  Usb,
  Power,
  PlayCircle,
  StopCircle,
  Download,
  Car,
} from 'lucide-react';

interface HeaderBarProps {
  connectionMode: ConnectionMode;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleDemo: () => void;
  onExportSingleFileHtml: () => void;
  isBrowserSupported: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  connectionMode,
  onConnect,
  onDisconnect,
  onToggleDemo,
  onExportSingleFileHtml,
  isBrowserSupported,
}) => {
  const isConnected = connectionMode === 'connected';
  const isDemo = connectionMode === 'demo';
  const isConnecting = connectionMode === 'connecting';

  return (
    <header className="w-full glass-panel border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-xl">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)]">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            SmartPark 3D
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            3-Slot Telemetry System · Arduino Uno @ 9600
          </span>
        </div>
      </div>

      {/* Zone 2: System Status Indicator (Clean typography, no pill sandwiches) */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : isDemo
                ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                : isConnecting
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-600'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {isConnected
              ? 'ARDUINO UNO CONNECTED'
              : isDemo
              ? 'SIMULATED DEMO ACTIVE'
              : isConnecting
              ? 'CONNECTING VIA WEB SERIAL...'
              : 'OFFLINE / DISCONNECTED'}
          </span>
        </div>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>WEB SERIAL API</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>9600 BAUD</span>
      </div>

      {/* Zone 3: Primary Action Controls */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Connect / Disconnect Buttons */}
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-medium font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 whitespace-nowrap"
            title={
              !isBrowserSupported
                ? 'Web Serial requires Chrome or Edge desktop'
                : 'Request Web Serial port at 9600 baud'
            }
          >
            <Usb className="w-3.5 h-3.5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Arduino'}</span>
          </button>
        )}

        {/* Demo Mode Toggle Button */}
        <button
          onClick={onToggleDemo}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono flex items-center gap-1.5 transition-all whitespace-nowrap border ${
            isDemo
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'glass-panel text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
          }`}
          title="Toggle sensor simulator with traffic cycles"
        >
          {isDemo ? (
            <>
              <StopCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Stop Demo</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Mode</span>
            </>
          )}
        </button>

        {/* Download Standalone Single-File HTML */}
        <button
          onClick={onExportSingleFileHtml}
          className="px-3 py-1.5 rounded-xl glass-panel text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600 text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap"
          title="Download as 100% self-contained single-file HTML to run offline"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Single HTML</span>
        </button>
      </div>
    </header>
  );
};
