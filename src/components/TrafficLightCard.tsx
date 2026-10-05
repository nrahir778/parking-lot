import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, ArrowUpRight } from 'lucide-react';

export type TrafficLightColor = 'green' | 'yellow' | 'red' | 'orange';

interface TrafficLightCardProps {
  occupiedCount: number;
  totalSlots: number;
  freeCount: number;
  isExitingOrange: boolean;
  gateStatus: 'OPEN' | 'CLOSED';
  isLightMode?: boolean;
}

export const TrafficLightCard: React.FC<TrafficLightCardProps> = ({
  occupiedCount,
  totalSlots,
  freeCount,
  isExitingOrange,
  gateStatus,
  isLightMode = false,
}) => {
  // Determine traffic light state
  let color: TrafficLightColor = 'green';
  let label = 'SPACE AVAILABLE';
  let subtext = 'Drive in · Parking bays available';

  if (isExitingOrange) {
    color = 'orange';
    label = 'VEHICLE EXITING...';
    subtext = 'Spot cleared from full parking · Barrier adjusting';
  } else if (occupiedCount >= totalSlots && totalSlots > 0) {
    color = 'red';
    label = 'PARKING FULL';
    subtext = 'All bays occupied · Barrier Gate Closed';
  } else if (occupiedCount === 2) {
    color = 'yellow';
    label = 'ALMOST FULL';
    subtext = 'Only 1 slot remaining · Proceed with caution';
  } else {
    color = 'green';
    label = 'SPACE AVAILABLE';
    subtext = `${freeCount} of ${totalSlots} parking slots ready`;
  }

  // Visual styles according to state
  const isRed = color === 'red';
  const isYellow = color === 'yellow';
  const isGreen = color === 'green';
  const isOrange = color === 'orange';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden shadow-lg ${
        isRed
          ? isLightMode
            ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-rose-500/10'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-100 shadow-[0_8px_30px_rgba(244,63,94,0.18)]'
          : isOrange
          ? isLightMode
            ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-amber-500/15'
            : 'bg-amber-950/40 border-amber-500/60 text-amber-100 shadow-[0_8px_30px_rgba(245,158,11,0.25)]'
          : isYellow
          ? isLightMode
            ? 'bg-yellow-50/90 border-yellow-300 text-yellow-950 shadow-yellow-500/10'
            : 'bg-yellow-950/30 border-yellow-500/40 text-yellow-100 shadow-[0_8px_30px_rgba(234,179,8,0.15)]'
          : isLightMode
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-emerald-500/10'
          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.15)]'
      }`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-500 ${
          isRed
            ? 'bg-rose-500'
            : isOrange
            ? 'bg-amber-500 animate-pulse'
            : isYellow
            ? 'bg-yellow-400'
            : 'bg-emerald-500'
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Realistic 3-Lens Traffic Light Housing */}
        <div className="flex items-center gap-4">
          <div
            className={`p-2 sm:p-2.5 rounded-2xl flex items-center gap-2 border shadow-inner ${
              isLightMode
                ? 'bg-slate-900 border-slate-700 shadow-black/40'
                : 'bg-black/80 border-slate-800 shadow-black/80'
            }`}
          >
            {/* 🔴 Red Lens */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                isRed
                  ? 'bg-rose-500 border-rose-300 shadow-[0_0_16px_#f43f5e] ring-2 ring-rose-400/50'
                  : 'bg-rose-950/40 border-rose-900/30 opacity-40'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isRed ? 'bg-white/80' : 'bg-transparent'
                }`}
              />
            </div>

            {/* 🟡 Yellow / 🟠 Orange Lens */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                isOrange
                  ? 'bg-amber-500 border-amber-300 shadow-[0_0_20px_#f59e0b] ring-4 ring-amber-400/60 animate-pulse scale-105'
                  : isYellow
                  ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_16px_#facc15] ring-2 ring-yellow-400/50'
                  : 'bg-yellow-950/40 border-yellow-900/30 opacity-40'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isOrange || isYellow ? 'bg-white/80' : 'bg-transparent'
                }`}
              />
            </div>

            {/* 🟢 Green Lens */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${
                isGreen
                  ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_16px_#10b981] ring-2 ring-emerald-400/50'
                  : 'bg-emerald-950/40 border-emerald-900/30 opacity-40'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isGreen ? 'bg-white/80' : 'bg-transparent'
                }`}
              />
            </div>
          </div>

          {/* Traffic Signal Text & Transition Status */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-md ${
                  isRed
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : isOrange
                    ? 'bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 animate-pulse'
                    : isYellow
                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}
              >
                Traffic Light Status
              </span>
              {isOrange && (
                <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-black animate-bounce">
                  EXIT SIGNAL
                </span>
              )}
            </div>

            <h3
              className={`text-xl sm:text-2xl font-black tracking-tight mt-1 font-sans ${
                isOrange ? 'animate-pulse text-amber-500 dark:text-amber-400' : ''
              }`}
            >
              {label}
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isLightMode ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {subtext}
            </p>
          </div>
        </div>

        {/* Right: Live Slots Metric & Gate Badge */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 flex-wrap">
          {/* Occupied Fraction Pill */}
          <div
            className={`px-3 py-2 rounded-xl border flex items-center gap-2.5 ${
              isLightMode
                ? 'bg-white/80 border-slate-200 shadow-xs'
                : 'bg-black/30 border-white/10'
            }`}
          >
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Occupied
              </div>
              <div className="text-base sm:text-lg font-mono font-black tabular-nums">
                {occupiedCount}
                <span className="text-xs text-slate-400 font-normal"> / {totalSlots}</span>
              </div>
            </div>
            <div className="h-7 w-[1px] bg-slate-300 dark:bg-slate-700" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Available
              </div>
              <div className="text-base sm:text-lg font-mono font-black tabular-nums text-emerald-500">
                {freeCount}
                <span className="text-xs text-slate-400 font-normal"> / {totalSlots}</span>
              </div>
            </div>
          </div>

          {/* Gate Pill */}
          <div
            className={`px-3 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
              gateStatus === 'OPEN'
                ? isLightMode
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isLightMode
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {gateStatus === 'OPEN' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-70">Barrier</span>
              <span>GATE: {gateStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
