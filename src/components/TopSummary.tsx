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
      {/* 4-Card Primary Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Occupied & Empty Count Card */}
        <div className={`rounded-2xl p-4 flex items-center justify-between border ${cardBaseStyle}`}>
          <div>
            <span
              className={`text-[11px] font-medium tracking-wider uppercase ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Occupied / Empty
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold tabular-nums">
                {occupiedSlots}
                <span
                  className={`text-xl font-normal ${
                    isLightMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {' '}
                  / {totalSlots}
                </span>
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isLotFull
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isLotFull ? 'LOT FULL' : `${availableSlots} EMPTY`}
              </span>
            </div>
            <div
              className={`text-xs mt-1 flex items-center gap-1.5 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLotFull ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span>{isLotFull ? 'All bays occupied' : `${availableSlots} bay(s) available`}</span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
              isLotFull
                ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
            }`}
          >
            {isLotFull ? <AlertCircle className="w-5 h-5" /> : <ParkingSquare className="w-5 h-5" />}
          </div>
        </div>

        {/* 2. MG995 Gate Servo Status Card */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            gateState.status === 'CLOSED'
              ? isLightMode
                ? 'bg-rose-50/80 border-rose-200 text-slate-900'
                : 'border-rose-500/30 bg-rose-950/[0.1] text-white'
              : cardBaseStyle
          }`}
        >
          <div>
            <span
              className={`text-[11px] font-medium tracking-wider uppercase ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              MG995 Gate Servo
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-bold tabular-nums">
                {gateState.angle}°
              </span>
              <span
                className={`text-xs font-mono font-bold uppercase ${
                  gateState.status === 'CLOSED'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {gateState.status}
              </span>
            </div>
            <div
              className={`text-xs mt-1 flex items-center gap-1.5 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span className="font-mono text-[10px]">Pin D11</span>
              <span aria-hidden="true">·</span>
              <span className="text-[11px]">
                {gateState.status === 'CLOSED' ? 'Barrier lowered' : 'Barrier open'}
              </span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
              gateState.status === 'CLOSED'
                ? 'bg-rose-500/15 text-rose-600 border-rose-500/40'
                : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Arduino Buzzer Status Card */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            hardwareBuzzerOn
              ? isLightMode
                ? 'bg-amber-50 border-amber-300 text-slate-900'
                : 'border-amber-500/40 bg-amber-950/[0.2] text-white'
              : cardBaseStyle
          }`}
        >
          <div>
            <span
              className={`text-[11px] font-medium tracking-wider uppercase ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Arduino Buzzer
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold tabular-nums ${
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
                className={`text-[11px] font-mono ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {hardwareBuzzerOn ? 'ALERT' : 'STANDBY'}
              </span>
            </div>
            <div
              className={`text-xs mt-1 flex items-center gap-1.5 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span className="font-mono text-[10px]">Pin D8</span>
              <span aria-hidden="true">·</span>
              <span className="text-[11px]">
                {hardwareBuzzerOn ? 'All 3 slots full' : 'Silent'}
              </span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
              hardwareBuzzerOn
                ? 'bg-amber-500/20 text-amber-600 border-amber-500/50 animate-pulse'
                : isLightMode
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Hardware Connection Status Card */}
        <div className={`rounded-2xl p-4 flex items-center justify-between border ${cardBaseStyle}`}>
          <div>
            <span
              className={`text-[11px] font-medium tracking-wider uppercase ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Connection Link
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-base font-mono font-bold uppercase ${
                  connectionMode === 'connected_usb' || connectionMode === 'connected_bt'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : connectionMode === 'connecting'
                    ? 'text-amber-500'
                    : isLightMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {connectionMode === 'connected_usb'
                  ? 'USB CONNECTED'
                  : connectionMode === 'connected_bt'
                  ? 'BT CONNECTED'
                  : connectionMode === 'connecting'
                  ? 'CONNECTING'
                  : 'OFFLINE'}
              </span>
            </div>
            <div
              className={`text-xs mt-1 flex items-center gap-1.5 truncate max-w-[190px] ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  connectionMode === 'connected_usb' || connectionMode === 'connected_bt'
                    ? 'bg-emerald-500 shadow-xs'
                    : 'bg-slate-400'
                }`}
              />
              <span className="truncate font-mono text-[10px]">
                {connectionMode === 'connected_usb'
                  ? (portLabel || 'Arduino Uno (COM @ 9600)')
                  : connectionMode === 'connected_bt'
                  ? (portLabel || 'HC-05 Bluetooth')
                  : 'Awaiting USB / Bluetooth'}
              </span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
              connectionMode === 'connected_bt'
                ? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                : connectionMode === 'connected_usb'
                ? 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30'
                : isLightMode
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {connectionMode === 'connected_bt' ? (
              <Bluetooth className="w-5 h-5" />
            ) : connectionMode === 'connected_usb' ? (
              <Usb className="w-5 h-5" />
            ) : (
              <Cpu className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Hardware Logic Bar */}
      <div
        className={`px-4 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-mono transition-colors ${
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
