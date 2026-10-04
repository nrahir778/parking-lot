import React, { useMemo } from 'react';
import { SlotData } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Clock,
  Navigation,
  IndianRupee,
  Receipt,
  Car,
} from 'lucide-react';

interface SlotCardProps {
  slot: SlotData;
  isLightMode?: boolean;
  onToggleSlotStatus?: (slotId: 1 | 2 | 3) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  isLightMode = false,
  onToggleSlotStatus,
}) => {
  const isOccupied = slot.status === 'OCCUPIED';
  const isEmpty = slot.status === 'EMPTY' || slot.status === 'AVAILABLE';

  // Format time of last update
  const formattedTime = slot.lastUpdated
    ? new Date(slot.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Waiting for sensor';

  const unit = slot.unit || 'cm';
  // Progress bar calculation (0 - 50 cm range)
  const distPercent = Math.min(100, Math.max(0, (slot.distance / 50) * 100));

  // Parked duration text
  const durationText = useMemo(() => {
    if (!isOccupied || !slot.parkedSince) return '00:00';
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - slot.parkedSince) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }, [isOccupied, slot.parkedSince, slot.currentCharge]);

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-md ${
        isOccupied
          ? isLightMode
            ? 'bg-rose-50/90 border-rose-300 text-slate-900 shadow-rose-100/50'
            : 'border-rose-500/40 bg-rose-950/20 text-white shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
          : isEmpty
          ? isLightMode
            ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-emerald-100/50'
            : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
          : isLightMode
          ? 'bg-white border-slate-200 text-slate-800'
          : 'border-slate-800 bg-slate-900/40 text-slate-200'
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

      {/* Header: Lot Name & Status Badge */}
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
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40">
                    LIVE
                  </span>
                )}
              </h4>
              <p
                className={`text-[11px] font-sans ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Ultrasonic Bay Sensor
              </p>
            </div>
          </div>

          {/* Status Badge: EMPTY (green), OCCUPIED (red), UNKNOWN (grey) */}
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
                <span>AVAILABLE</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3.5 h-3.5" />
                <span>READY</span>
              </>
            )}
          </div>
        </div>

        {/* PRICING & LIVE BILLING BOX */}
        <div className="mt-3 p-3 rounded-xl border bg-black/5 dark:bg-black/35 border-black/10 dark:border-white/10 space-y-2">
          {/* Rate Header & Total Lot Collection */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>₹10 / MIN</span>
            </span>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Total Collection: <span className="text-amber-500 dark:text-amber-400 font-mono font-black tabular-nums">₹{slot.totalCollection || 0}</span>
            </span>
          </div>

          {/* Active Bill Display */}
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isOccupied ? 'Live Charge (Updates every 3s)' : 'Current Charge'}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-2xl font-mono font-black tabular-nums ${
                  isOccupied ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-slate-400'
                }`}>
                  ₹{(slot.currentCharge || 0).toFixed(2)}
                </span>
                {isOccupied && (
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    · {durationText}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Car Info or Ready Status */}
            <div className="text-right">
              {isOccupied ? (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {slot.car.plate}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                    {slot.car.modelName}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                  ₹0.00 for next car
                </span>
              )}
            </div>
          </div>

          {/* Last Automatic Cut Deduction Information */}
          {slot.lastDeduction && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <span className="flex items-center gap-1">
                <Receipt className="w-3 h-3 text-cyan-500" />
                <span>Last auto-deducted:</span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ₹{slot.lastDeduction.amountPaid.toFixed(2)} ({Math.max(1, Math.round(slot.lastDeduction.durationSeconds / 60))}m)
              </span>
            </div>
          )}
        </div>

        {/* Distance Proximity Display */}
        <div className="mt-3 p-3 rounded-xl border bg-black/5 dark:bg-black/30 border-black/5 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span
              className={`font-semibold tracking-wide uppercase flex items-center gap-1.5 ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Navigation className="w-3 h-3 text-cyan-500" />
              <span>Vehicle Proximity</span>
            </span>
            <span
              className={`font-mono font-semibold ${
                isOccupied ? 'text-rose-500 font-bold' : isEmpty ? 'text-emerald-500 font-bold' : 'text-slate-400'
              }`}
            >
              {isOccupied ? 'Vehicle Parked' : isEmpty ? 'Bay Cleared' : 'Standby'}
            </span>
          </div>

          {/* Large Proximity Value */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight">
                {slot.hasHardwareReading ? slot.distance.toFixed(1) : '--.-'}
              </span>
              <span className="text-sm font-mono font-bold opacity-75">
                {unit}
              </span>
            </div>

            {/* Test Simulation Button if interactive */}
            {onToggleSlotStatus && (
              <button
                onClick={() => onToggleSlotStatus(slot.id)}
                className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors cursor-pointer flex items-center gap-1"
                title="Simulate vehicle arrival or departure"
              >
                <Car className="w-3 h-3" />
                <span>{isOccupied ? 'Exit Car' : 'Park Car'}</span>
              </button>
            )}
          </div>

          {/* Smooth Distance Gauge */}
          <div className="w-full bg-slate-300/80 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOccupied ? 'bg-rose-500' : isEmpty ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
              style={{ width: `${distPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Live Timestamp */}
      <div
        className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
          isLightMode ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isOccupied ? 'bg-rose-500' : isEmpty ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <span>{isOccupied ? 'Occupied' : isEmpty ? 'Vacant' : 'Awaiting sensor'}</span>
        </span>

        <span className="flex items-center gap-1 opacity-75">
          <Clock className="w-3 h-3" />
          <span>{formattedTime}</span>
        </span>
      </div>
    </div>
  );
};
