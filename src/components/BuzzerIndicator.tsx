import React from 'react';
import { Volume2, VolumeX, BellRing, Activity } from 'lucide-react';
import { BuzzerState } from '../types';

interface BuzzerIndicatorProps {
  buzzerState: BuzzerState;
  onTriggerPulse: (pulses: 1 | 2 | 3) => void;
  onToggleAudio: () => void;
}

export const BuzzerIndicator: React.FC<BuzzerIndicatorProps> = ({
  buzzerState,
  onTriggerPulse,
  onToggleAudio,
}) => {
  const { active, pulseCount, currentPulse, audioEnabled } = buzzerState;

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
      {/* Background Strobe Flare when buzzer is active */}
      {active && (
        <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none transition-opacity duration-200" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Buzzer Icon + State Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {/* Concentric Animated Sound Wave Rings */}
            {active && (
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
                active
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_25px_#f59e0b] scale-105'
                  : 'bg-slate-800/90 text-amber-400 border border-slate-700/60'
              }`}
            >
              <BellRing
                className={`w-6 h-6 ${active ? 'animate-bounce' : ''}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Common Piezo Buzzer
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase transition-colors ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {active ? `PULSING (${currentPulse}/${pulseCount})` : 'STANDBY'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Arduino Pattern Alert</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">PWM Pin Output</span>
            </div>
          </div>
        </div>

        {/* Center: 3 Animated Pulse Nodes */}
        <div className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-xl border border-slate-800/90">
          <div className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
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
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                      : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                  }`}
                >
                  {pulseIndex}
                </div>
                <span className="text-[9px] font-mono text-slate-400">
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
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
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
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onTriggerPulse(1)}
              disabled={active}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Trigger 1 Pulse (Slot 1 warning)"
            >
              1P
            </button>
            <button
              onClick={() => onTriggerPulse(2)}
              disabled={active}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Trigger 2 Pulses (Slot 2 warning)"
            >
              2P
            </button>
            <button
              onClick={() => onTriggerPulse(3)}
              disabled={active}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
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
