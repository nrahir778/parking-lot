import React from 'react';
import { Volume2, VolumeX, BellRing, Activity } from 'lucide-react';
import { BuzzerState } from '../types';

interface BuzzerIndicatorProps {
  buzzerState: BuzzerState;
  onTriggerPulse: (pulses: 1 | 2 | 3) => void;
  onToggleAudio: () => void;
  isLightMode?: boolean;
}

export const BuzzerIndicator: React.FC<BuzzerIndicatorProps> = ({
  buzzerState,
  onTriggerPulse,
  onToggleAudio,
  isLightMode = false,
}) => {
  const { active, pulseCount, currentPulse, audioEnabled, hardwareBuzzerOn } = buzzerState;

  return (
    <div
      className={`rounded-2xl p-4 md:p-5 border transition-all duration-300 relative overflow-hidden ${
        hardwareBuzzerOn
          ? isLightMode
            ? 'border-amber-400 bg-amber-50/80 shadow-md text-slate-900'
            : 'border-amber-500/50 bg-amber-950/[0.15] shadow-[0_0_25px_rgba(245,158,11,0.2)] text-white'
          : isLightMode
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : 'glass-panel border-slate-800/80 shadow-lg text-white'
      }`}
    >
      {/* Background Strobe Flare when buzzer is active */}
      {(active || hardwareBuzzerOn) && (
        <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none transition-opacity duration-200" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Buzzer Icon + State Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {/* Concentric Animated Sound Wave Rings */}
            {(active || hardwareBuzzerOn) && (
              <>
                <div className="absolute -inset-2 rounded-full border border-amber-400/60 animate-buzzer-wave pointer-events-none" />
                <div
                  className="absolute -inset-4 rounded-full border border-amber-400/40 animate-buzzer-wave pointer-events-none"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="absolute -inset-6 rounded-full border border-amber-400/20 animate-buzzer-wave pointer-events-none"
                  style={{ animationDelay: '0.4s' }}
                />
              </>
            )}

            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                active || hardwareBuzzerOn
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_25px_#f59e0b] scale-105'
                  : isLightMode
                  ? 'bg-slate-100 text-amber-600 border border-slate-200'
                  : 'bg-slate-800/90 text-amber-400 border border-slate-700/60'
              }`}
            >
              <BellRing
                className={`w-6 h-6 ${active || hardwareBuzzerOn ? 'animate-bounce' : ''}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide">
                Common Piezo Buzzer (Pin D8)
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase transition-colors ${
                  hardwareBuzzerOn
                    ? 'bg-amber-500/30 text-amber-700 dark:text-amber-200 border-amber-500/60 shadow-xs animate-pulse'
                    : active
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-xs'
                    : isLightMode
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {hardwareBuzzerOn
                  ? 'D8 ACTIVE (LOT FULL)'
                  : active
                  ? `PULSING (${currentPulse}/${pulseCount})`
                  : 'STANDBY (OFF)'}
              </span>
            </div>
            <div
              className={`text-xs mt-0.5 flex items-center gap-2 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>Arduino Pin D8</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Triggered when all 3 slots occupied</span>
            </div>
          </div>
        </div>

        {/* Center: 3 Animated Pulse Nodes */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800/90'
          }`}
        >
          <div
            className={`text-[11px] font-mono mr-1 flex items-center gap-1 ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>PULSES:</span>
          </div>

          {[1, 2, 3].map((pulseIndex) => {
            const isTargetOfPattern = active && pulseCount >= pulseIndex;
            const isCurrentlyBeeping = active && currentPulse === pulseIndex;

            return (
              <div
                key={pulseIndex}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 ${
                    isCurrentlyBeeping
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_16px_#f59e0b] scale-110'
                      : isTargetOfPattern
                      ? 'bg-amber-500/30 text-amber-700 dark:text-amber-200 border border-amber-500/50'
                      : isLightMode
                      ? 'bg-white text-slate-400 border border-slate-200'
                      : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                  }`}
                >
                  {pulseIndex}
                </div>
                <span
                  className={`text-[9px] font-mono ${
                    isLightMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {pulseIndex === 1 ? 'Slot 1' : pulseIndex === 2 ? 'Slot 2' : 'Slot 3'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Manual Test Triggers & Audio Toggle */}
        <div className="flex items-center gap-2">
          {/* Audio on/off button */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-lg transition-colors border ${
              audioEnabled
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                : isLightMode
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'glass-panel text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title={audioEnabled ? 'Mute Synthesizer Sound' : 'Enable Piezo Sound Synthesizer'}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Quick pulse trigger test buttons */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg border ${
              isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <button
              onClick={() => onTriggerPulse(1)}
              disabled={active}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors disabled:opacity-50 ${
                isLightMode ? 'hover:bg-white text-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Trigger 1 Pulse (Slot 1 warning)"
            >
              1P
            </button>
            <button
              onClick={() => onTriggerPulse(2)}
              disabled={active}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors disabled:opacity-50 ${
                isLightMode ? 'hover:bg-white text-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Trigger 2 Pulses (Slot 2 warning)"
            >
              2P
            </button>
            <button
              onClick={() => onTriggerPulse(3)}
              disabled={active}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors disabled:opacity-50 ${
                isLightMode ? 'hover:bg-white text-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Trigger 3 Pulses (Slot 3 / Full alert)"
            >
              3P
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
