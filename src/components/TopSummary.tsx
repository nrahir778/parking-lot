import React from 'react';
import { SlotData } from '../types';
import { Car, CheckCircle2, ParkingSquare, AlertCircle } from 'lucide-react';

interface TopSummaryProps {
  slots: SlotData[];
}

export const TopSummary: React.FC<TopSummaryProps> = ({ slots }) => {
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyPercentage = Math.round((occupiedSlots / totalSlots) * 100);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {/* Total Slots Card */}
      <div className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border border-slate-800/80 shadow-lg">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            Total Slots
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl md:text-4xl font-mono font-bold text-white tabular-nums">
              {totalSlots}
            </span>
            <span className="text-xs text-slate-500 font-mono">BAYS</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Standard capacity
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
          <ParkingSquare className="w-6 h-6" />
        </div>
      </div>

      {/* Available Slots Card */}
      <div className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border border-emerald-500/20 bg-emerald-950/[0.08] shadow-lg">
        <div>
          <span className="text-xs font-medium text-emerald-400/90 tracking-wide uppercase">
            Available Slots
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl md:text-4xl font-mono font-bold text-emerald-400 tabular-nums">
              {availableSlots}
            </span>
            <span className="text-xs text-emerald-500/80 font-mono">FREE</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready for parking</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Occupied Slots Card */}
      <div className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border border-rose-500/20 bg-rose-950/[0.08] shadow-lg">
        <div>
          <span className="text-xs font-medium text-rose-400/90 tracking-wide uppercase">
            Occupied Slots
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl md:text-4xl font-mono font-bold text-rose-400 tabular-nums">
              {occupiedSlots}
            </span>
            <span className="text-xs text-rose-500/80 font-mono">{occupancyPercentage}% CAP</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            {occupiedSlots === totalSlots ? (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Lot Full
              </span>
            ) : (
              <span>Spaces in use</span>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <Car className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
