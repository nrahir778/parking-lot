import React from 'react';
import { SlotData, GateState, ConnectionMode } from '../types';
import {
  Car,
  CheckCircle2,
  ParkingSquare,
  AlertCircle,
  ShieldAlert,
  Bell,
  Cpu,
  Power,
} from 'lucide-react';

interface TopSummaryProps {
  slots: SlotData[];
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  connectionMode: ConnectionMode;
  portLabel?: string;
}

export const TopSummary: React.FC<TopSummaryProps> = ({
  slots,
  gateState,
  hardwareBuzzerOn,
  connectionMode,
  portLabel,
}) => {
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
  const availableSlots = totalSlots - occupiedSlots;
  const isLotFull = occupiedSlots === totalSlots;

  return (
    <div className="w-full space-y-3">
      {/* 4-Card Primary Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Occupied & Empty Count Card */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-slate-800/80 shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Occupied / Empty
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-white tabular-nums">
                {occupiedSlots}
                <span className="text-xl text-slate-500 font-normal"> / {totalSlots}</span>
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isLotFull ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isLotFull ? 'LOT FULL' : `${availableSlots} EMPTY`}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLotFull ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span>{isLotFull ? 'All bays taken' : `${availableSlots} bay(s) available`}</span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
              isLotFull
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isLotFull ? <AlertCircle className="w-5 h-5" /> : <ParkingSquare className="w-5 h-5" />}
          </div>
        </div>

        {/* 2. MG995 Gate Servo Status Card */}
        <div
          className={`glass-panel rounded-2xl p-4 flex items-center justify-between border shadow-lg transition-all ${
            gateState.status === 'CLOSED'
              ? 'border-rose-500/30 bg-rose-950/[0.08]'
              : 'border-emerald-500/20 bg-emerald-950/[0.08]'
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              MG995 Gate Servo
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-bold text-white tabular-nums">
                {gateState.angle}°
              </span>
              <span
                className={`text-xs font-mono font-bold uppercase ${
                  gateState.status === 'CLOSED' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {gateState.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-400">PWM Pin D11</span>
              <span aria-hidden="true">·</span>
              <span className="text-[11px]">
                {gateState.status === 'CLOSED' ? 'Barrier lowered' : 'Barrier raised'}
              </span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
              gateState.status === 'CLOSED'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Arduino Buzzer Status Card */}
        <div
          className={`glass-panel rounded-2xl p-4 flex items-center justify-between border shadow-lg transition-all ${
            hardwareBuzzerOn
              ? 'border-amber-500/40 bg-amber-950/[0.15]'
              : 'border-slate-800/80'
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Arduino Buzzer
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-mono font-bold tabular-nums ${
                  hardwareBuzzerOn ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {hardwareBuzzerOn ? 'ON' : 'OFF'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {hardwareBuzzerOn ? 'ALERT ACTIVE' : 'SILENT'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-400">Pin D8</span>
              <span aria-hidden="true">·</span>
              <span className="text-[11px]">
                {hardwareBuzzerOn ? 'All 3 slots occupied' : 'Normal standby'}
              </span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
              hardwareBuzzerOn
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Hardware Connection Status Card */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-slate-800/80 shadow-lg">
          <div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
              Hardware Link
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-lg font-mono font-bold uppercase ${
                  connectionMode === 'connected'
                    ? 'text-emerald-400'
                    : connectionMode === 'demo'
                    ? 'text-cyan-400'
                    : connectionMode === 'connecting'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {connectionMode === 'connected'
                  ? 'CONNECTED'
                  : connectionMode === 'demo'
                  ? 'DEMO MODE'
                  : connectionMode === 'connecting'
                  ? 'CONNECTING'
                  : 'OFFLINE'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate max-w-[180px]">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  connectionMode === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : connectionMode === 'demo'
                    ? 'bg-cyan-400'
                    : 'bg-slate-600'
                }`}
              />
              <span className="truncate font-mono text-[10px]">
                {connectionMode === 'connected'
                  ? (portLabel || 'Arduino Uno (9600)')
                  : connectionMode === 'demo'
                  ? 'Simulated Telemetry'
                  : 'Awaiting Web Serial'}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Hardware Logic Bar */}
      <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">DETECTION RULE:</span>
          <span>Slot is OCCUPIED when (Distance ≤ 3.0 cm) AND (FSR ≥ 15)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>All 3 Occupied → Servo 90° (Gate Closed) + Buzzer ON</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-500">Otherwise: Servo 0° (Gate Open) + Buzzer OFF</span>
        </div>
      </div>
    </div>
  );
};
