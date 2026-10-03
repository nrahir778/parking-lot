import React from 'react';
import { SlotData, GateState, ConnectionMode } from '../types';
import {
  ParkingSquare,
  AlertCircle,
  ShieldAlert,
  Bell,
  Cpu,
  Bluetooth,
  Usb,
} from 'lucide-react';

interface TopSummaryProps {
  slots: SlotData[];
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  connectionMode: ConnectionMode;
  portLabel?: string;
  isLightMode?: boolean;
}

export const TopSummary: React.FC<TopSummaryProps> = ({
  slots,
  gateState,
  hardwareBuzzerOn,
  connectionMode,
  portLabel,
  isLightMode = false,
}) => {
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
  const availableSlots = totalSlots - occupiedSlots;
  const isLotFull = occupiedSlots === totalSlots;

  const cardBaseStyle = isLightMode
    ? 'bg-white border-slate-200 shadow-sm text-slate-900'
    : 'glass-panel border-slate-800/80 shadow-lg text-white';

  return (
    <div className="w-full space-y-3">
      {/* 4-Card Primary Status Grid (Mobile: 2x2 grid, Laptop: 4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {/* 1. Occupied & Empty Count Card */}
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between border ${cardBaseStyle}`}>
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] sm:text-[11px] font-medium tracking-wider uppercase block truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Occupied / Empty
            </span>
            <div className="flex items-baseline flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold tabular-nums">
                {occupiedSlots}
                <span
                  className={`text-lg sm:text-xl font-normal ${
                    isLightMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {' '}
                  / {totalSlots}
                </span>
              </span>
              <span
                className={`text-[10px] sm:text-xs font-mono font-bold ${
                  isLotFull
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isLotFull ? 'FULL' : `${availableSlots} FREE`}
              </span>
            </div>
            <div
              className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  isLotFull ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span className="truncate">{isLotFull ? 'All bays full' : `${availableSlots} available`}</span>
            </div>
          </div>
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 ${
              isLotFull
                ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
            }`}
          >
            {isLotFull ? <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <ParkingSquare className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </div>

        {/* 2. MG995 Gate Servo Status Card */}
        <div
          className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
            gateState.status === 'CLOSED'
              ? isLightMode
                ? 'bg-rose-50/80 border-rose-200 text-slate-900'
                : 'border-rose-500/30 bg-rose-950/[0.1] text-white'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] sm:text-[11px] font-medium tracking-wider uppercase block truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              MG995 Gate
            </span>
            <div className="flex items-baseline flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-xl sm:text-2xl font-mono font-bold tabular-nums">
                {gateState.angle}°
              </span>
              <span
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase ${
                  gateState.status === 'CLOSED'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {gateState.status}
              </span>
            </div>
            <div
              className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span className="font-mono text-[9px] sm:text-[10px]">Pin D11</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">
                {gateState.status === 'CLOSED' ? 'Closed' : 'Open'}
              </span>
            </div>
          </div>
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 ${
              gateState.status === 'CLOSED'
                ? 'bg-rose-500/15 text-rose-600 border-rose-500/40'
                : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 3. Arduino Buzzer Status Card */}
        <div
          className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
            hardwareBuzzerOn
              ? isLightMode
                ? 'bg-amber-50 border-amber-300 text-slate-900'
                : 'border-amber-500/40 bg-amber-950/[0.2] text-white'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] sm:text-[11px] font-medium tracking-wider uppercase block truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Buzzer Pin D8
            </span>
            <div className="flex items-baseline flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span
                className={`text-xl sm:text-2xl font-mono font-bold tabular-nums ${
                  hardwareBuzzerOn
                    ? 'text-amber-600 dark:text-amber-400'
                    : isLightMode
                    ? 'text-slate-700'
                    : 'text-slate-300'
                }`}
              >
                {hardwareBuzzerOn ? 'ON' : 'OFF'}
              </span>
              <span
                className={`text-[9px] sm:text-[11px] font-mono ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {hardwareBuzzerOn ? 'ALARM' : 'QUIET'}
              </span>
            </div>
            <div
              className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span className="font-mono text-[9px] sm:text-[10px]">Pin D8</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">
                {hardwareBuzzerOn ? 'Alarm active' : 'Silent'}
              </span>
            </div>
          </div>
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 ${
              hardwareBuzzerOn
                ? 'bg-amber-500/20 text-amber-600 border-amber-500/50 animate-pulse'
                : isLightMode
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 4. Hardware Connection Status Card */}
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between border ${cardBaseStyle}`}>
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] sm:text-[11px] font-medium tracking-wider uppercase block truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Hardware Link
            </span>
            <div className="flex items-baseline flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-sm sm:text-base font-mono font-bold uppercase truncate">
                {connectionMode === 'connected_usb'
                  ? 'USB LINK'
                  : connectionMode === 'connected_bt'
                  ? 'HC-05 BT'
                  : connectionMode === 'connecting'
                  ? 'WAITING'
                  : 'OFFLINE'}
              </span>
            </div>
            <div
              className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                  connectionMode.startsWith('connected')
                    ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                    : connectionMode === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-slate-400'
                }`}
              />
              <span className="truncate">
                {connectionMode.startsWith('connected') ? '9600 Baud' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border shadow-xs shrink-0 ml-1.5 ${
              connectionMode === 'connected_bt'
                ? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                : connectionMode === 'connected_usb'
                ? 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {connectionMode === 'connected_bt' ? (
              <Bluetooth className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Usb className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Hardware Logic Bar */}
      <div
        className={`px-3 sm:px-4 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono transition-colors ${
          isLightMode
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">DETECTION RULE:</span>
          <span>Slot is OCCUPIED when (Distance ≤ 3.0 cm) AND (FSR ≥ 15)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>All 3 Occupied → Servo 90° (Gate Closed) + Buzzer ON</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>Baud: 9600</span>
        </div>
      </div>
    </div>
  );
};
