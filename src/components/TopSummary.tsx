import React, { useState, useEffect } from 'react';
import { SlotData, GateState, ConnectionMode, ArduinoSummaryData } from '../types';
import {
  Car,
  ParkingSquare,
  ShieldCheck,
  ShieldAlert,
  Bluetooth,
  Usb,
  Radio,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { downloadArduinoInoFile } from '../utils/downloadFirmware';

interface TopSummaryProps {
  slots: SlotData[];
  arduinoSummary?: ArduinoSummaryData | null;
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  connectionMode: ConnectionMode;
  portLabel?: string;
  isLightMode?: boolean;
  lastDataReceivedAt?: number | null;
  onConnectBluetooth?: () => void;
}

export const TopSummary: React.FC<TopSummaryProps> = ({
  slots,
  arduinoSummary,
  gateState,
  connectionMode,
  portLabel,
  isLightMode = false,
  lastDataReceivedAt,
  onConnectBluetooth,
}) => {
  const [now, setNow] = useState(Date.now());
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';
  const secondsSinceLastData = lastDataReceivedAt ? Math.round((now - lastDataReceivedAt) / 1000) : null;
  const isStale = isConnected && secondsSinceLastData !== null && secondsSinceLastData > 6;

  const totalSlots = arduinoSummary ? arduinoSummary.totalSlots : slots.length;
  const occupiedCount = arduinoSummary
    ? arduinoSummary.totalOccupied
    : slots.filter((s) => s.status === 'OCCUPIED').length;

  const freeCount = Math.max(0, totalSlots - occupiedCount);
  const isParkingFull = totalSlots > 0 && occupiedCount >= totalSlots;

  const effectiveGateStatus = arduinoSummary ? arduinoSummary.gate : gateState.status;
  const isGateOpen = effectiveGateStatus === 'OPEN';

  const cardBaseStyle = isLightMode
    ? 'bg-white border-slate-200 shadow-xs text-slate-900'
    : 'glass-panel border-slate-800/80 shadow-md text-white';

  const handleDownloadCode = () => {
    downloadArduinoInoFile();
    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 3000);
  };

  return (
    <div className="w-full space-y-3">
      {/* Live Status Bar & Arduino Firmware Download Option */}
      <div
        className={`px-3.5 py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono transition-colors ${
          isConnected
            ? isStale
              ? isLightMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : isLightMode
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : isLightMode
            ? 'bg-white border-slate-200 text-slate-600'
            : 'glass-panel border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center flex-wrap gap-2">
          {isConnected ? (
            <>
              {connectionMode === 'connected_bt' ? (
                <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Bluetooth className="w-4 h-4 shrink-0" />
                  <span>{portLabel || 'HC-05 Bluetooth Connected'}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                  <Usb className="w-4 h-4 shrink-0" />
                  <span>{portLabel || 'Arduino USB Connected'}</span>
                </span>
              )}
              <span className="hidden sm:inline opacity-40">·</span>
              <span className="text-[11px] opacity-80">
                {secondsSinceLastData !== null && secondsSinceLastData <= 1
                  ? 'Receiving sensor data'
                  : secondsSinceLastData !== null
                  ? `Last signal ${secondsSinceLastData}s ago`
                  : 'Ready'}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>System Standby · Connect hardware to stream telemetry</span>
            </div>
          )}
        </div>

        {/* Dynamic Action: Download Arduino Firmware when Connected (or Connect Bluetooth when Disconnected) */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <button
              onClick={handleDownloadCode}
              className="px-2.5 py-1 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              title="Download the exact Arduino C++ firmware (.ino) running on this Arduino"
            >
              {hasDownloaded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Downloaded .ino!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Download Arduino Code (.ino)</span>
                </>
              )}
            </button>
          ) : (
            onConnectBluetooth && (
              <button
                onClick={onConnectBluetooth}
                className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Connect HC-05</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 3 Core Metric Cards: Clean, High-Contrast, No Duplicate Text */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. AVAILABLE SPACES */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            freeCount > 0
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-sm'
                : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              AVAILABLE SPACES
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-black tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
                {freeCount}
              </span>
              <span className="text-xs font-mono font-semibold opacity-70">
                / {totalSlots} Free
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-emerald-500/20 text-emerald-600 border-emerald-500/40">
            <ParkingSquare className="w-5 h-5" />
          </div>
        </div>

        {/* 2. OCCUPIED SPACES */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            isParkingFull
              ? isLightMode
                ? 'bg-rose-50/90 border-rose-300 text-slate-900 shadow-sm'
                : 'border-rose-500/40 bg-rose-950/20 text-white shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isParkingFull ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                OCCUPIED
              </span>
              {isParkingFull && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                  FULL
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-mono font-black tabular-nums tracking-tight ${
                  isParkingFull ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {occupiedCount}
              </span>
              <span className="text-xs font-mono font-semibold opacity-70">
                / {totalSlots} Taken
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              isParkingFull
                ? 'bg-rose-500/20 text-rose-600 border-rose-500/40'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            <Car className="w-5 h-5" />
          </div>
        </div>

        {/* 3. BARRIER GATE */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            isGateOpen
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-sm'
                : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              : isLightMode
              ? 'bg-slate-50 border-slate-200 text-slate-900'
              : 'border-slate-800 bg-slate-900/40 text-white'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isGateOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              BARRIER GATE
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-xl font-mono font-black uppercase tracking-wider ${
                  isGateOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {effectiveGateStatus === 'OPEN' ? 'GATE OPEN' : 'GATE CLOSED'}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              isGateOpen
                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {isGateOpen ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
