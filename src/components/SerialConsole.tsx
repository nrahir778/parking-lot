import React, { useState, useRef, useEffect } from 'react';
import { ConnectionMode, SerialLogEntry } from '../types';
import {
  Terminal,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  Pause,
  Send,
  Cpu,
} from 'lucide-react';

interface SerialConsoleProps {
  logs: SerialLogEntry[];
  connectionMode: ConnectionMode;
  onClearLogs: () => void;
  onSendSerialCommand?: (cmd: string) => void;
  isBrowserSupported: boolean;
  errorMessage?: string | null;
}

export const SerialConsole: React.FC<SerialConsoleProps> = ({
  logs,
  connectionMode,
  onClearLogs,
  onSendSerialCommand,
  isBrowserSupported,
  errorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputCmd, setInputCmd] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const copyToClipboard = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.line}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim() || !onSendSerialCommand) return;
    onSendSerialCommand(inputCmd.trim());
    setInputCmd('');
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="p-4 flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                Live Arduino Serial Monitor
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                (9600 BAUD)
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{logs.length} events logged</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-slate-500">
                Format: SLOT X | Distance: X.X cm | Pressure: XXX | STATUS: XXX
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border bg-slate-900/80 border-slate-700/80">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionMode === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : connectionMode === 'demo'
                  ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                  : connectionMode === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span className="uppercase text-[10px] font-bold text-slate-300">
              {connectionMode}
            </span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Console Body */}
      {isOpen && (
        <div className="border-t border-slate-800/80 bg-[#090d16]/90 p-4 space-y-3">
          {/* Unsupported Browser Alert banner */}
          {!isBrowserSupported && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Web Serial Unsupported in Current Browser:</span>{' '}
                Chrome or Edge desktop is required for real physical USB serial connection.
                <span className="block mt-0.5 text-slate-300">
                  Demo Mode is active so you can test all 3D animations, sensors, and buzzer logic seamlessly!
                </span>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Connection Notice:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
                  autoScroll
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>Auto-scroll</span>
              </button>

              <button
                onClick={onClearLogs}
                className="px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Log'}</span>
            </button>
          </div>

          {/* Terminal Output Screen */}
          <div
            ref={logContainerRef}
            className="w-full h-48 bg-black/60 rounded-xl p-3 font-mono text-xs overflow-y-auto border border-slate-800 space-y-1"
          >
            {logs.length === 0 ? (
              <div className="text-slate-500 italic h-full flex items-center justify-center">
                Waiting for serial data stream at 9600 baud...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`break-all ${
                      log.type === 'buzzer'
                        ? 'text-amber-400 font-bold'
                        : log.type === 'system'
                        ? 'text-cyan-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {log.line}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Test Command Injector / Simulator */}
          <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCmd}
                onChange={(e) => setInputCmd(e.target.value)}
                placeholder="Simulate or send serial line: e.g. SLOT 1 | Distance: 2.5 cm | Pressure: 500 | STATUS: OCCUPIED"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!inputCmd.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inject</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
