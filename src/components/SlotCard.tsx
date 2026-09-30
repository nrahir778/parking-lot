import React from 'react';
import { SlotData } from '../types';
import { Radio, Scale, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

interface SlotCardProps {
  slot: SlotData;
  isLightMode?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, isLightMode = false }) => {
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

  const distPercent = Math.min(100, Math.max(0, (slot.distance / 50) * 100));
  const fsrPercent = Math.min(100, Math.max(0, (fsrValue / 1023) * 100));

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${
        isOccupied
          ? isLightMode
            ? 'bg-rose-50/70 border-rose-200 shadow-sm text-slate-900'
            : 'border-rose-500/30 bg-rose-950/[0.07] shadow-lg text-white'
          : isLightMode
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : 'border-emerald-500/30 bg-emerald-950/[0.07] shadow-lg text-white'
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
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-xs ${
                isOccupied
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
              }`}
            >
              {slot.id}
            </div>
            <div>
              <h4 className="text-base font-bold tracking-wide flex items-center gap-2">
                <span>{slot.name}</span>
                {slot.hasHardwareReading && (
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40">
                    LIVE HW
                  </span>
                )}
              </h4>
              <div
                className={`text-[11px] font-mono flex items-center gap-1.5 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
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
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/50 shadow-xs'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/50 shadow-xs'
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
          <div
            className={`rounded-xl p-3 border transition-colors ${
              isLightMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/70 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span
                className={`flex items-center gap-1.5 font-medium ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-500" />
                HC-SR04 Distance
              </span>
              <span className="font-mono font-bold tabular-nums text-sm">
                {slot.distance.toFixed(1)}{' '}
                <span className={`text-xs font-normal ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  cm
                </span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div
              className={`w-full h-2 rounded-full overflow-hidden relative ${
                isLightMode ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            >
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
            <div
              className={`flex justify-between items-center text-[10px] font-mono mt-1.5 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1">
                {isDistSatisfied ? (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Dist ≤ 3 cm Met
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <X className="w-3 h-3 text-slate-400" /> Dist &gt; 3 cm
                  </span>
                )}
              </span>
              <span>Target: ≤ 3.0 cm</span>
            </div>
          </div>

          {/* 2. FSR Force Sensor Gauge */}
          <div
            className={`rounded-xl p-3 border transition-colors ${
              isLightMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/70 border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span
                className={`flex items-center gap-1.5 font-medium ${
                  isLightMode ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-indigo-500" />
                FSR Force Reading ({pinInfo.fsrPin})
              </span>
              <span className="font-mono font-bold tabular-nums text-sm">
                {fsrValue}{' '}
                <span className={`text-xs font-normal ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  / 1023
                </span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div
              className={`w-full h-2 rounded-full overflow-hidden relative ${
                isLightMode ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            >
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFsrSatisfied ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-400 dark:bg-slate-600'
                }`}
                style={{ width: `${fsrPercent}%` }}
              />
            </div>

            {/* Condition check indicator */}
            <div
              className={`flex justify-between items-center text-[10px] font-mono mt-1.5 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1">
                {isFsrSatisfied ? (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> FSR ≥ 15 Met
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <X className="w-3 h-3 text-slate-400" /> FSR &lt; 15
                  </span>
                )}
              </span>
              <span>Target: ≥ 15</span>
            </div>
          </div>
        </div>

        {/* Dual Condition Summary Result */}
        <div
          className={`mt-3 p-2 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
            isLightMode ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <span>Logic Status:</span>
          <span
            className={`font-semibold ${
              isOccupied
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isDistSatisfied && isFsrSatisfied
              ? 'Both conditions satisfied'
              : !isDistSatisfied && !isFsrSatisfied
              ? 'Neither condition satisfied'
              : !isDistSatisfied
              ? 'Awaiting vehicle distance'
              : 'Awaiting weight on FSR'}
          </span>
        </div>
      </div>
    </div>
  );
};
