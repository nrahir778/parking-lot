import React, { useState, useEffect } from 'react';
import { SlotData, GateState, ConnectionMode, ArduinoSummaryData } from '../types';
import {
  Car,
  CheckCircle2,
  ParkingSquare,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Bluetooth,
  Usb,
} from 'lucide-react';

interface TopSummaryProps {
  slots: SlotData[];
  arduinoSummary?: ArduinoSummaryData | null;
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  connectionMode: ConnectionMode;
  portLabel?: string;
  isLightMode?: boolean;
  lastDataReceivedAt?: number | null;
}

export const TopSummary: React.FC<TopSummaryProps> = ({
  slots,
  arduinoSummary,
  gateState,
  hardwareBuzzerOn,
  connectionMode,
  portLabel,
  isLightMode = false,
  lastDataReceivedAt,
}) => {
  // Timer tick to keep "Xs ago" and stale status updated live
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';
  const secondsSinceLastData = lastDataReceivedAt ? Math.round((now - lastDataReceivedAt) / 1000) : null;
  const isStale = isConnected && secondsSinceLastData !== null && secondsSinceLastData > 6;

  // Use Arduino summary line if available, otherwise compute from slots
  const totalSlots = arduinoSummary ? arduinoSummary.totalSlots : slots.length;
  const occupiedCount = arduinoSummary
    ? arduinoSummary.totalOccupied
    : slots.filter((s) => s.status === 'OCCUPIED').length;
  const occupiedFraction = arduinoSummary
    ? arduinoSummary.occupiedFraction
    : `${occupiedCount}/${totalSlots}`;
  const emptyCount = arduinoSummary
    ? arduinoSummary.empty
    : slots.filter((s) => s.status === 'EMPTY' || s.status === 'AVAILABLE').length;
  const unknownCount = arduinoSummary
    ? arduinoSummary.unknown
    : slots.filter((s) => s.status === 'UNKNOWN').length;
  const availableCount = arduinoSummary
    ? arduinoSummary.available
    : emptyCount;

  // Gate status priority: Arduino summary > gateState
  const effectiveGateStatus = arduinoSummary ? arduinoSummary.gate : gateState.status;
  const isGateOpen = effectiveGateStatus === 'OPEN';

  const cardBaseStyle = isLightMode
    ? 'bg-white border-slate-200 shadow-sm text-slate-900'
    : 'glass-panel border-slate-800/80 shadow-lg text-white';

  return (
    <div className="w-full space-y-3">
      {/* Real-time Connection Status & Last Received Data Bar */}
      <div
        className={`px-3.5 sm:px-4 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono transition-colors shadow-xs ${
          isStale
            ? isLightMode
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : isLightMode
            ? 'bg-white border-slate-200 text-slate-700'
            : 'glass-panel border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Connection Mode Pill */}
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected
                  ? isStale
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  : connectionMode === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-400'
              }`}
            />
            <span className="uppercase">
              {connectionMode === 'connected_usb'
                ? `USB: ${portLabel || 'ARDUINO UNO'}`
                : connectionMode === 'connected_bt'
                ? `BT: ${portLabel || 'HC-05'}`
                : connectionMode === 'connecting'
                ? 'CONNECTING TO ARDUINO...'
                : 'OFFLINE / AWAITING SERIAL MONITOR DATA'}
            </span>
          </div>

          <span aria-hidden="true" className="opacity-30">|</span>

          {/* Stale / Live Status Indicator */}
          {isConnected && (
            <div className="flex items-center gap-1.5 font-semibold">
              {isStale ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>STALE DATA ({secondsSinceLastData}s since last line)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>LIVE ARDUINO FEED</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time of Last Received Data */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 opacity-70" />
          <span>
            Last Received:{' '}
            <strong className="text-cyan-600 dark:text-cyan-400">
              {lastDataReceivedAt
                ? `${new Date(lastDataReceivedAt).toLocaleTimeString()} (${
                    secondsSinceLastData === 0 ? 'just now' : `${secondsSinceLastData}s ago`
                  })`
                : 'No serial data yet'}
            </strong>
          </span>
        </div>
      </div>

      {/* Large Summary Cards: OCCUPIED (1/3), EMPTY (2), UNKNOWN (0), AVAILABLE (2) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
        {/* 1. OCCUPIED CARD */}
        <div
          className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border transition-all ${
            occupiedCount > 0
              ? isLightMode
                ? 'bg-rose-50/90 border-rose-300 text-slate-900 shadow-rose-100/50'
                : 'border-rose-500/40 bg-rose-950/20 text-white shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase block truncate text-rose-600 dark:text-rose-400">
              OCCUPIED
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight">
                {occupiedFraction}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">
              {occupiedCount === totalSlots ? 'Lot is completely full' : `${occupiedCount} space taken`}
            </span>
          </div>
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 ${
              occupiedCount > 0
                ? 'bg-rose-500/20 text-rose-600 border-rose-500/40'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            <Car className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 2. EMPTY CARD */}
        <div
          className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border transition-all ${
            emptyCount > 0
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-emerald-100/50'
                : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase block truncate text-emerald-600 dark:text-emerald-400">
              EMPTY
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
                {emptyCount}
              </span>
              <span className="text-xs font-mono font-bold opacity-75">/ {totalSlots}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">
              Vacant parking bays
            </span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 bg-emerald-500/20 text-emerald-600 border-emerald-500/40">
            <ParkingSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 3. AVAILABLE CARD */}
        <div
          className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border transition-all ${
            availableCount > 0
              ? isLightMode
                ? 'bg-teal-50/90 border-teal-300 text-slate-900 shadow-teal-100/50'
                : 'border-teal-500/40 bg-teal-950/20 text-white shadow-[0_4px_20px_rgba(20,184,166,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase block truncate text-teal-600 dark:text-teal-400">
              AVAILABLE
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight text-teal-600 dark:text-teal-400">
                {availableCount}
              </span>
              <span className="text-xs font-mono font-bold opacity-75">SPACES</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">
              Ready for entry
            </span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 bg-teal-500/20 text-teal-600 border-teal-500/40">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 4. UNKNOWN CARD */}
        <div className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border ${cardBaseStyle}`}>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase block truncate text-slate-500 dark:text-slate-400">
              UNKNOWN
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight text-slate-600 dark:text-slate-300">
                {unknownCount}
              </span>
              <span className="text-xs font-mono font-bold opacity-60">UNVERIFIED</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">
              Unreachable sensors
            </span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 bg-slate-500/15 text-slate-500 border-slate-500/30">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 5. GATE STATUS CARD (CLEAR GATE OPEN / GATE CLOSED INDICATOR) */}
        <div
          className={`col-span-2 sm:col-span-2 lg:col-span-1 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border transition-all ${
            isGateOpen
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-slate-900'
                : 'border-emerald-500/40 bg-emerald-950/20 text-white'
              : isLightMode
              ? 'bg-rose-50/90 border-rose-300 text-slate-900'
              : 'border-rose-500/40 bg-rose-950/20 text-white'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase block truncate ${
                isGateOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              BARRIER GATE
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
              <span
                className={`text-xl sm:text-2xl font-mono font-black uppercase tracking-wider ${
                  isGateOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 animate-pulse'
                }`}
              >
                {effectiveGateStatus === 'OPEN' ? 'GATE OPEN' : 'GATE CLOSED'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">
              {isGateOpen ? 'Entry barrier raised (0°)' : 'Entry barrier lowered (90°)'}
            </span>
          </div>
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 ${
              isGateOpen
                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-600 border-rose-500/40'
            }`}
          >
            {isGateOpen ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
