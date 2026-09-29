import React from 'react';
import { SlotData } from '../types';
import { Car, Radio, Scale, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

interface SlotCardProps {
  slot: SlotData;
  onToggleStatus: (id: 1 | 2 | 3) => void;
  onUpdateSensorValues?: (id: 1 | 2 | 3, distance: number, fsr: number) => void;
  isDemoMode: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  onToggleStatus,
  onUpdateSensorValues,
  isDemoMode,
}) => {
  const isOccupied = slot.status === 'OCCUPIED';

  // Hardware pin mapping for each slot
  const pinInfo = {
    1: { trig: 'D2', echo: 'D3', fsrPin: 'A0' },
    2: { trig: 'D4', echo: 'D5', fsrPin: 'A1' },
    3: { trig: 'D6', echo: 'D7', fsrPin: 'A2' },
  }[slot.id];

  // Hardware conditions:
  // Occupied if: Distance <= 3.0 cm AND FSR >= 15
  const isDistSatisfied = slot.distance <= 3.0;
  const fsrValue = slot.fsr ?? slot.pressure;
  const isFsrSatisfied = fsrValue >= 15;

  // Percentage for progress display
  // For distance: 0 - 50 cm
  const distPercent = Math.min(100, Math.max(0, (slot.distance / 50) * 100));
  // For FSR: 0 - 1023
  const fsrPercent = Math.min(100, Math.max(0, (fsrValue / 1023) * 100));

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${
        isOccupied
          ? 'border-rose-500/30 bg-rose-950/[0.07] shadow-[0_8px_30px_rgba(244,63,94,0.15)]'
          : 'border-emerald-500/30 bg-emerald-950/[0.07] shadow-[0_8px_30px_rgba(16,185,129,0.15)]'
      }`}
    >
      {/* Ambient Top Glow Line */}
      <div
        className={`absolute top-0 inset-x-0 h-1 transition-colors duration-500 ${
          isOccupied
            ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent'
            : 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent'
        }`}
      />

      {/* Header: Slot Name, Pinout, Status Badge */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-inner ${
                isOccupied
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {slot.id}
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>{slot.name}</span>
                {slot.hasHardwareReading && (
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    LIVE HW
                  </span>
                )}
              </h4>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>TRIG {pinInfo.trig} / ECHO {pinInfo.echo}</span>
                <span aria-hidden="true">·</span>
                <span>FSR {pinInfo.fsrPin}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 transition-all duration-300 ${
              isOccupied
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isOccupied ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>OCCUPIED</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AVAILABLE</span>
              </>
            )}
          </div>
        </div>

        {/* Dual Telemetry Gauges: Distance & FSR Sensor */}
        <div className="mt-4 space-y-3.5">
          {/* 1. HC-SR04 Ultrasonic Distance Gauge */}
          <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                HC-SR04 Distance
              </span>
              <span className="font-mono font-bold text-slate-100 tabular-nums text-sm">
                {slot.distance.toFixed(1)}{' '}
                <span className="text-xs text-slate-500 font-normal">cm</span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isDistSatisfied
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : slot.distance < 10
                    ? 'bg-amber-400'
                    : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                }`}
                style={{ width: `${distPercent}%` }}
              />
            </div>

            {/* Condition check indicator */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1.5">
              <span className="flex items-center gap-1">
                {isDistSatisfied ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Dist ≤ 3 cm Met
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-0.5">
                    <X className="w-3 h-3 text-slate-500" /> Dist &gt; 3 cm
                  </span>
                )}
              </span>
              <span className="text-slate-400">Target: ≤ 3.0 cm</span>
            </div>
          </div>

          {/* 2. FSR Force Sensor Gauge */}
          <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                FSR Force Reading ({pinInfo.fsrPin})
              </span>
              <span className="font-mono font-bold text-slate-100 tabular-nums text-sm">
                {fsrValue}{' '}
                <span className="text-xs text-slate-500 font-normal">/ 1023</span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFsrSatisfied
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${fsrPercent}%` }}
              />
            </div>

            {/* Condition check indicator */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1.5">
              <span className="flex items-center gap-1">
                {isFsrSatisfied ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> FSR ≥ 15 Met
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-0.5">
                    <X className="w-3 h-3 text-slate-500" /> FSR &lt; 15
                  </span>
                )}
              </span>
              <span className="text-slate-400">Target: ≥ 15</span>
            </div>
          </div>
        </div>

        {/* Dual Condition Summary Result */}
        <div className="mt-3 p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-400">
          <span>Logic Status:</span>
          <span
            className={`font-semibold ${
              isOccupied ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isDistSatisfied && isFsrSatisfied
              ? 'Both conditions satisfied'
              : !isDistSatisfied && !isFsrSatisfied
              ? 'Neither condition satisfied'
              : !isDistSatisfied
              ? 'Awaiting vehicle proximity'
              : 'Awaiting weight on FSR'}
          </span>
        </div>
      </div>

      {/* Interactive Controls & Slot Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
        <button
          onClick={() => onToggleStatus(slot.id)}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 border ${
            isOccupied
              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>{isOccupied ? 'Simulate Vacate' : 'Simulate Park (≤3cm & ≥15)'}</span>
        </button>

        {/* Demo Mode Manual Range Sliders for Testing */}
        {isDemoMode && onUpdateSensorValues && (
          <div className="mt-1 pt-2 border-t border-slate-800/50 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Simulate Dist:</span>
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.5"
                value={slot.distance}
                onChange={(e) => {
                  const newDist = parseFloat(e.target.value);
                  onUpdateSensorValues(slot.id, newDist, fsrValue);
                }}
                className="w-28 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="font-mono text-slate-300 w-10 text-right">
                {slot.distance.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Simulate FSR:</span>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={fsrValue}
                onChange={(e) => {
                  const newFsr = parseInt(e.target.value, 10);
                  onUpdateSensorValues(slot.id, slot.distance, newFsr);
                }}
                className="w-28 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <span className="font-mono text-slate-300 w-10 text-right">
                {fsrValue}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
