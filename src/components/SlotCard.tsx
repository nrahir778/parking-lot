import React from 'react';
import { SlotData } from '../types';
import { Radio, ShieldCheck, ShieldAlert, HelpCircle, Clock } from 'lucide-react';

interface SlotCardProps {
  slot: SlotData;
  isLightMode?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, isLightMode = false }) => {
  const isOccupied = slot.status === 'OCCUPIED';
  const isEmpty = slot.status === 'EMPTY' || slot.status === 'AVAILABLE';
  const isUnknown = slot.status === 'UNKNOWN';

  // Format time of last update
  const formattedTime = slot.lastUpdated
    ? new Date(slot.lastUpdated).toLocaleTimeString()
    : 'No data yet';

  // Hardware pin mapping for reference
  const pinInfo = {
    1: { trig: 'D2', echo: 'D3' },
    2: { trig: 'D4', echo: 'D5' },
    3: { trig: 'D6', echo: 'D7' },
  }[slot.id];

  const unit = slot.unit || 'cm';
  // Progress bar calculation (0 - 50 cm range)
  const distPercent = Math.min(100, Math.max(0, (slot.distance / 50) * 100));

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-md ${
        isOccupied
          ? isLightMode
            ? 'bg-rose-50/80 border-rose-300 text-slate-900 shadow-rose-100'
            : 'border-rose-500/40 bg-rose-950/20 text-white shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
          : isEmpty
          ? isLightMode
            ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-emerald-100'
            : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
          : isLightMode
          ? 'bg-slate-100/90 border-slate-300 text-slate-800'
          : 'border-slate-700 bg-slate-900/40 text-slate-200'
      }`}
    >
      {/* Ambient Top Glow Line */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 transition-colors duration-300 ${
          isOccupied
            ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent'
            : isEmpty
            ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-500 to-transparent'
        }`}
      />

      {/* Header: Lot Name, Status Badge & Hardware Tag */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm sm:text-base border shadow-xs ${
                isOccupied
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40'
                  : isEmpty
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/40'
              }`}
            >
              0{slot.id}
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-1.5">
                <span>{slot.name.toUpperCase().startsWith('LOT') ? slot.name : `LOT ${slot.id}`}</span>
                {slot.hasHardwareReading && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40">
                    LIVE
                  </span>
                )}
              </h4>
              <div
                className={`text-[10px] sm:text-[11px] font-mono flex items-center gap-1.5 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <span>TRIG {pinInfo.trig}</span>
                <span aria-hidden="true">·</span>
                <span>ECHO {pinInfo.echo}</span>
              </div>
            </div>
          </div>

          {/* Arduino Status Badge: EMPTY (green), OCCUPIED (red), UNKNOWN (grey) */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 shadow-xs transition-all ${
              isOccupied
                ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/30'
                : isEmpty
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30'
                : 'bg-slate-600 text-slate-100 border-slate-400 shadow-slate-600/20'
            }`}
          >
            {isOccupied ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>OCCUPIED</span>
              </>
            ) : isEmpty ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>EMPTY</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3.5 h-3.5" />
                <span>UNKNOWN</span>
              </>
            )}
          </div>
        </div>

        {/* Distance Display & Gauge */}
        <div className="mt-4 p-3.5 rounded-xl border bg-black/5 dark:bg-black/30 border-black/5 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-medium tracking-wide uppercase flex items-center gap-1 ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Radio className="w-3 h-3 text-cyan-500" />
              <span>Reported Distance</span>
            </span>
            <span
              className={`text-[10px] font-mono font-semibold ${
                isOccupied ? 'text-rose-500' : isEmpty ? 'text-emerald-500' : 'text-slate-400'
              }`}
            >
              {isOccupied ? '≤ 3.0 cm (Occupied)' : isEmpty ? '> 3.0 cm (Empty)' : 'No signal'}
            </span>
          </div>

          {/* Large Decimal Distance (e.g. 3.1 cm, 2.3 cm, 4.1 cm) */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-mono font-black tabular-nums tracking-tight">
              {slot.hasHardwareReading ? slot.distance.toFixed(1) : '--.-'}
            </span>
            <span className="text-sm sm:text-base font-mono font-bold opacity-75">
              {unit}
            </span>
          </div>

          {/* Mini Distance Bar Gauge */}
          <div className="w-full bg-slate-300 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOccupied ? 'bg-rose-500' : isEmpty ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
              style={{ width: `${distPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Arduino Source of Truth Status & Last Updated Timestamp */}
      <div
        className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono ${
          isLightMode ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
        }`}
      >
        <span className="flex items-center gap-1 font-semibold truncate">
          <span
            className={`w-2 h-2 rounded-full ${
              isOccupied ? 'bg-rose-500' : isEmpty ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <span>Arduino Status: {slot.status}</span>
        </span>

        <span className="flex items-center gap-1 text-[10px] opacity-80 shrink-0">
          <Clock className="w-3 h-3" />
          <span>{formattedTime}</span>
        </span>
      </div>
    </div>
  );
};
