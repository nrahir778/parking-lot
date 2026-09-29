import React from 'react';
import { SlotData } from '../types';
import { Car, Gauge, Radio, Scale, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SlotCardProps {
  slot: SlotData;
  onToggleStatus: (id: 1 | 2 | 3) => void;
  onUpdateSensorValues?: (id: 1 | 2 | 3, distance: number, pressure: number) => void;
  isDemoMode: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  onToggleStatus,
  onUpdateSensorValues,
  isDemoMode,
}) => {
  const isOccupied = slot.status === 'OCCUPIED';

  // Distance range: 0 - 50cm (under 10cm is considered occupied / close)
  const distPercent = Math.min(100, Math.max(0, (slot.distance / 50) * 100));

  // Pressure range: 0 - 1023 (above 200 is considered weight detected)
  const pressPercent = Math.min(100, Math.max(0, (slot.pressure / 1023) * 100));

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

      {/* Header: Slot Name, Car Plate, Status Badge */}
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
              <h4 className="text-base font-bold text-white tracking-wide">
                {slot.name}
              </h4>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>Bay #{slot.id}</span>
                <span aria-hidden="true">·</span>
                <span>{slot.car.modelName}</span>
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

        {/* Dual Telemetry Gauges: Distance & Pressure */}
        <div className="mt-5 space-y-4">
          {/* Ultrasonic Distance Gauge */}
          <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Ultrasonic Distance
              </span>
              <span className="font-mono font-bold text-slate-200 tabular-nums text-sm">
                {slot.distance.toFixed(1)}{' '}
                <span className="text-xs text-slate-500 font-normal">cm</span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  slot.distance < 10
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : slot.distance < 20
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                }`}
                style={{ width: `${distPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 cm (Close)</span>
              <span>Threshold: 10 cm</span>
              <span>50 cm</span>
            </div>
          </div>

          {/* Pressure Sensor Gauge */}
          <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                Pressure Sensor (ADC)
              </span>
              <span className="font-mono font-bold text-slate-200 tabular-nums text-sm">
                {slot.pressure}{' '}
                <span className="text-xs text-slate-500 font-normal">/ 1023</span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  slot.pressure > 250
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${pressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 (No load)</span>
              <span>Active Threshold: 200</span>
              <span>1023</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Slot Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleStatus(slot.id)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 border ${
              isOccupied
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{isOccupied ? 'Vacate Slot' : 'Park Vehicle'}</span>
          </button>
        </div>

        {/* Demo Mode Manual Range Sliders for Quick Testing */}
        {isDemoMode && onUpdateSensorValues && (
          <div className="mt-1 pt-2 border-t border-slate-800/50 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Simulate Dist:</span>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={slot.distance}
                onChange={(e) => {
                  const newDist = parseFloat(e.target.value);
                  onUpdateSensorValues(slot.id, newDist, slot.pressure);
                }}
                className="w-28 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="font-mono text-slate-300 w-10 text-right">
                {slot.distance.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Simulate Press:</span>
              <input
                type="range"
                min="0"
                max="1023"
                step="20"
                value={slot.pressure}
                onChange={(e) => {
                  const newPress = parseInt(e.target.value, 10);
                  onUpdateSensorValues(slot.id, slot.distance, newPress);
                }}
                className="w-28 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <span className="font-mono text-slate-300 w-10 text-right">
                {slot.pressure}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
