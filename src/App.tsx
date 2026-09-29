import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SlotData,
  SlotStatus,
  ConnectionMode,
  BuzzerState,
  SerialLogEntry,
  SlotId,
  GateState,
} from './types';
import { HeaderBar } from './components/HeaderBar';
import { TopSummary } from './components/TopSummary';
import { IsometricParkingLot } from './components/IsometricParkingLot';
import { BuzzerIndicator } from './components/BuzzerIndicator';
import { SlotCard } from './components/SlotCard';
import { SerialConsole } from './components/SerialConsole';
import { ArduinoGuideModal } from './components/ArduinoGuideModal';
import {
  serialManager,
  SerialLineParser,
  ArduinoSerialManager,
} from './services/webSerial';
import { buzzerAudio } from './services/audioBuzzer';
import { exportStandaloneHtmlFile } from './utils/exportSingleFileHtml';
import { AlertTriangle, Info } from 'lucide-react';

const INITIAL_SLOTS: SlotData[] = [
  {
    id: 1,
    name: 'SLOT 1',
    status: 'AVAILABLE',
    distance: 45.0,
    pressure: 0,
    fsr: 0,
    lastUpdated: Date.now(),
    hasHardwareReading: false,
    car: {
      bodyColor: '#0284c7', // Cyber Azure / Metallic Blue
      roofColor: '#0369a1',
      accentColor: '#38bdf8',
      modelName: 'Tesla Model 3',
      plate: 'EV-804',
    },
  },
  {
    id: 2,
    name: 'SLOT 2',
    status: 'AVAILABLE',
    distance: 42.0,
    pressure: 0,
    fsr: 0,
    lastUpdated: Date.now(),
    hasHardwareReading: false,
    car: {
      bodyColor: '#3b82f6', // Sapphire Sport
      roofColor: '#1d4ed8',
      accentColor: '#93c5fd',
      modelName: 'Porsche Taycan',
      plate: 'PK-992',
    },
  },
  {
    id: 3,
    name: 'SLOT 3',
    status: 'AVAILABLE',
    distance: 48.0,
    pressure: 0,
    fsr: 0,
    lastUpdated: Date.now(),
    hasHardwareReading: false,
    car: {
      bodyColor: '#e11d48', // Ruby Metallic
      roofColor: '#be123c',
      accentColor: '#fda4af',
      modelName: 'Audi e-tron GT',
      plate: 'GT-331',
    },
  },
];

export default function App() {
  const [slots, setSlots] = useState<SlotData[]>(INITIAL_SLOTS);
  // Default to disconnected: only update dashboard from actual received hardware readings
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('disconnected');
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<SerialLogEntry[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(undefined);
  const [isArduinoGuideOpen, setIsArduinoGuideOpen] = useState(false);
  const [portLabel, setPortLabel] = useState<string | undefined>(undefined);

  // MG995 Gate Servo State: 0° = Open, 90° = Closed (Lot Full)
  const [gateState, setGateState] = useState<GateState>({
    angle: 0,
    status: 'OPEN',
  });

  // Buzzer State: Pin D8 hardware state + sequence pulse state
  const [buzzerState, setBuzzerState] = useState<BuzzerState>({
    active: false,
    pulseCount: 1,
    currentPulse: 0,
    audioEnabled: true,
    lastTriggered: 0,
    hardwareBuzzerOn: false,
  });

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log append helper
  const addLog = useCallback(
    (line: string, type: 'incoming' | 'system' | 'buzzer' | 'error' = 'incoming') => {
      const entry: SerialLogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        line,
        type,
      };
      setLogs((prev) => [...prev.slice(-150), entry]);
    },
    []
  );

  // Trigger Piezo Buzzer Pulse Pattern (1, 2, or 3 pulses)
  const triggerBuzzer = useCallback(
    async (pulseCount: 1 | 2 | 3) => {
      setBuzzerState((prev) => ({
        ...prev,
        active: true,
        pulseCount,
        currentPulse: 1,
        lastTriggered: Date.now(),
      }));

      addLog(`[BUZZER] Alert: ${pulseCount} pulse(s) emitted`, 'buzzer');

      await buzzerAudio.playPattern(pulseCount, (currentPulseIndex) => {
        setBuzzerState((prev) => ({
          ...prev,
          currentPulse: currentPulseIndex,
        }));
      });

      setBuzzerState((prev) => ({
        ...prev,
        active: false,
        currentPulse: 0,
      }));
    },
    [addLog]
  );

  // Helper to re-evaluate Gate Servo and Buzzer state from slot conditions
  const syncGateAndBuzzer = useCallback((currentSlots: SlotData[]) => {
    const allOccupied = currentSlots.every((s) => s.status === 'OCCUPIED');
    if (allOccupied) {
      setGateState({ angle: 90, status: 'CLOSED' });
      setBuzzerState((prev) => ({ ...prev, hardwareBuzzerOn: true }));
    } else {
      setGateState({ angle: 0, status: 'OPEN' });
      setBuzzerState((prev) => ({ ...prev, hardwareBuzzerOn: false }));
    }
  }, []);

  // Process incoming line from Arduino serial or demo simulator
  const handleIncomingSerialLine = useCallback(
    (rawLine: string) => {
      addLog(rawLine, 'incoming');

      const parsed = SerialLineParser.parse(rawLine);

      if (parsed.type === 'slot') {
        const { slotId, distance, fsr, status } = parsed.data;

        setSlots((currentSlots) => {
          const prevSlot = currentSlots.find((s) => s.id === slotId);
          const wasAvailable = prevSlot ? prevSlot.status === 'AVAILABLE' : false;

          // If a slot transitions from AVAILABLE -> OCCUPIED, trigger corresponding pulses
          if (wasAvailable && status === 'OCCUPIED') {
            triggerBuzzer(slotId);
          }

          const updated = currentSlots.map((slot) => {
            if (slot.id === slotId) {
              return {
                ...slot,
                status,
                distance,
                pressure: fsr,
                fsr,
                lastUpdated: Date.now(),
                hasHardwareReading: true,
              };
            }
            return slot;
          });

          // Check if all 3 slots are occupied -> trigger gate & buzzer
          syncGateAndBuzzer(updated);
          return updated;
        });
      } else if (parsed.type === 'gate_buzzer') {
        const { gateAngle, gateStatus, buzzerOn, pulseCount } = parsed.data;

        if (gateAngle !== undefined || gateStatus !== undefined) {
          const angle = gateAngle !== undefined ? gateAngle : gateStatus === 'CLOSED' ? 90 : 0;
          const stat = gateStatus || (angle >= 45 ? 'CLOSED' : 'OPEN');
          setGateState({ angle, status: stat });
        }

        if (buzzerOn !== undefined) {
          setBuzzerState((prev) => ({ ...prev, hardwareBuzzerOn: buzzerOn }));
        }

        if (pulseCount) {
          triggerBuzzer(pulseCount);
        }
      }
    },
    [addLog, triggerBuzzer, syncGateAndBuzzer]
  );

  // Toggle single slot status manually (for testing or simulation)
  const handleToggleSlot = useCallback(
    (slotId: SlotId) => {
      setSlots((currentSlots) => {
        const updated = currentSlots.map((slot) => {
          if (slot.id === slotId) {
            const willBeOccupied = slot.status !== 'OCCUPIED';
            const newStatus: SlotStatus = willBeOccupied ? 'OCCUPIED' : 'AVAILABLE';
            // Hardware thresholds: distance <= 3cm AND FSR >= 15
            const newDist = willBeOccupied
              ? parseFloat((1.2 + Math.random() * 1.5).toFixed(1)) // <= 3.0 cm
              : parseFloat((18.0 + Math.random() * 25).toFixed(1)); // > 3.0 cm
            const newFsr = willBeOccupied
              ? Math.floor(40 + Math.random() * 200) // >= 15
              : Math.floor(Math.random() * 5); // < 15

            const formattedLine = `SLOT ${slotId} | Distance: ${newDist.toFixed(1)} cm | FSR: ${newFsr} | STATUS: ${newStatus}`;
            addLog(formattedLine, 'incoming');

            if (willBeOccupied) {
              triggerBuzzer(slotId);
            }

            return {
              ...slot,
              status: newStatus,
              distance: newDist,
              pressure: newFsr,
              fsr: newFsr,
              lastUpdated: Date.now(),
              hasHardwareReading: false,
            };
          }
          return slot;
        });

        syncGateAndBuzzer(updated);
        return updated;
      });
    },
    [addLog, triggerBuzzer, syncGateAndBuzzer]
  );

  // Manual sensor value adjustment (sliders in Demo Mode)
  const handleUpdateSensorValues = useCallback(
    (slotId: SlotId, distance: number, fsr: number) => {
      setSlots((currentSlots) => {
        const updated = currentSlots.map((slot) => {
          if (slot.id === slotId) {
            // Hardware specification: distance <= 3.0 cm AND FSR >= 15 => OCCUPIED
            const isOccupied = distance <= 3.0 && fsr >= 15;
            const newStatus: SlotStatus = isOccupied ? 'OCCUPIED' : 'AVAILABLE';

            if (slot.status === 'AVAILABLE' && newStatus === 'OCCUPIED') {
              triggerBuzzer(slotId);
            }

            return {
              ...slot,
              distance,
              pressure: fsr,
              fsr,
              status: newStatus,
              lastUpdated: Date.now(),
              hasHardwareReading: false,
            };
          }
          return slot;
        });

        syncGateAndBuzzer(updated);
        return updated;
      });
    },
    [triggerBuzzer, syncGateAndBuzzer]
  );

  // Check Web Serial support on mount
  useEffect(() => {
    const supported = ArduinoSerialManager.isSupported();
    setIsBrowserSupported(supported);
  }, []);

  // Demo Mode Traffic Generator: ONLY runs when connectionMode === 'demo'
  useEffect(() => {
    if (connectionMode === 'demo') {
      addLog('[SYSTEM] Demo Mode activated. Simulating HC-SR04 & FSR telemetry.', 'system');

      demoIntervalRef.current = setInterval(() => {
        const randomSlotId = (Math.floor(Math.random() * 3) + 1) as SlotId;
        setSlots((currentSlots) => {
          const target = currentSlots.find((s) => s.id === randomSlotId);
          if (!target) return currentSlots;

          const willBeOccupied = target.status !== 'OCCUPIED';
          const newStatus: SlotStatus = willBeOccupied ? 'OCCUPIED' : 'AVAILABLE';
          // Follow exact hardware condition: dist <= 3.0 cm && FSR >= 15
          const newDist = willBeOccupied
            ? parseFloat((1.5 + Math.random() * 1.4).toFixed(1))
            : parseFloat((16.0 + Math.random() * 26).toFixed(1));
          const newFsr = willBeOccupied
            ? Math.floor(35 + Math.random() * 150)
            : Math.floor(Math.random() * 6);

          const formattedLine = `SLOT ${randomSlotId} | Distance: ${newDist.toFixed(1)} cm | FSR: ${newFsr} | STATUS: ${newStatus}`;
          addLog(formattedLine, 'incoming');

          if (willBeOccupied) {
            triggerBuzzer(randomSlotId);
          }

          const updated = currentSlots.map((s) =>
            s.id === randomSlotId
              ? {
                  ...s,
                  status: newStatus,
                  distance: newDist,
                  pressure: newFsr,
                  fsr: newFsr,
                  lastUpdated: Date.now(),
                  hasHardwareReading: false,
                }
              : s
          );

          syncGateAndBuzzer(updated);
          return updated;
        });
      }, 5000);
    } else {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    }

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, [connectionMode, addLog, triggerBuzzer, syncGateAndBuzzer]);

  // Connect to Arduino Uno through Chrome/Edge Web Serial API at 9600 baud
  const handleConnectSerial = async () => {
    setErrorMessage(null);
    if (!isBrowserSupported) {
      setErrorMessage(
        'Web Serial API is not supported in this browser. Please open in Google Chrome or Microsoft Edge on Windows 11.'
      );
      return;
    }

    try {
      setConnectionMode('connecting');
      addLog('[SYSTEM] Opening Web Serial prompt for Arduino Uno at 9600 baud...', 'system');

      serialManager.setCallbacks(
        (line) => {
          handleIncomingSerialLine(line);
        },
        (error) => {
          if (error) {
            addLog(`[ERROR] Serial disconnected: ${error.message}`, 'error');
            setErrorMessage(error.message);
          } else {
            addLog('[SYSTEM] Arduino Serial disconnected cleanly.', 'system');
          }
          setConnectionMode('disconnected');
          setPortLabel(undefined);
        }
      );

      await serialManager.connect(9600);
      const portInfo = serialManager.getPortInfo();
      const detectedLabel = portInfo?.label || 'Arduino Uno (COM)';
      setPortLabel(detectedLabel);
      setConnectionMode('connected');
      addLog(`[SYSTEM] Successfully connected to ${detectedLabel} @ 9600 baud. Receiving real hardware telemetry.`, 'system');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed or cancelled.';
      setErrorMessage(msg);
      addLog(`[SYSTEM] Connection aborted: ${msg}`, 'error');
      setConnectionMode('disconnected');
      setPortLabel(undefined);
    }
  };

  const handleDisconnectSerial = async () => {
    try {
      await serialManager.disconnect();
      setConnectionMode('disconnected');
      setPortLabel(undefined);
      addLog('[SYSTEM] Disconnected from serial port.', 'system');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error closing port';
      addLog(`[ERROR] ${msg}`, 'error');
    }
  };

  const handleToggleDemo = () => {
    if (connectionMode === 'demo') {
      setConnectionMode('disconnected');
      addLog('[SYSTEM] Demo Mode stopped. System is idle (offline).', 'system');
    } else {
      if (connectionMode === 'connected') {
        serialManager.disconnect();
      }
      setConnectionMode('demo');
    }
  };

  const handleToggleAudio = () => {
    const nextState = !buzzerState.audioEnabled;
    buzzerAudio.setMuted(!nextState);
    setBuzzerState((prev) => ({ ...prev, audioEnabled: nextState }));
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20">
      {/* Top Header Bar */}
      <HeaderBar
        connectionMode={connectionMode}
        onConnect={handleConnectSerial}
        onDisconnect={handleDisconnectSerial}
        onToggleDemo={handleToggleDemo}
        onExportSingleFileHtml={exportStandaloneHtmlFile}
        onOpenArduinoGuide={() => setIsArduinoGuideOpen(true)}
        isBrowserSupported={isBrowserSupported}
        portLabel={portLabel}
      />

      {/* Windows 11 Serial Conflict Warning Callout Banner (Dismissible info) */}
      {connectionMode === 'disconnected' && (
        <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 md:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Windows 11 Tip:</strong> Ensure the Arduino IDE{' '}
                <em className="text-amber-300">Serial Monitor is CLOSED</em> before clicking{' '}
                <strong>Connect Arduino</strong>. COM ports cannot be shared simultaneously.
              </span>
            </div>
            <button
              onClick={() => setIsArduinoGuideOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline"
            >
              View Arduino Uno Code & Pinout →
            </button>
          </div>
        </div>
      )}

      {/* Demo Mode Notice Banner (Ensures user knows demo is not real hardware) */}
      {connectionMode === 'demo' && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 md:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-300 font-mono">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DEMO MODE ACTIVE: Generating simulated HC-SR04 & FSR readings. Not connected to real Arduino hardware.</span>
            </span>
            <button
              onClick={() => setConnectionMode('disconnected')}
              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Top Summary Bar (Occupied/Empty, Gate, Buzzer, Hardware Link) */}
        <TopSummary
          slots={slots}
          gateState={gateState}
          hardwareBuzzerOn={buzzerState.hardwareBuzzerOn}
          connectionMode={connectionMode}
          portLabel={portLabel}
        />

        {/* 3D Isometric Parking Lot (With MG995 Gate & Live Status) */}
        <IsometricParkingLot
          slots={slots}
          gateState={gateState}
          hardwareBuzzerOn={buzzerState.hardwareBuzzerOn}
          onSlotClick={(id) => {
            setSelectedSlotId(id);
            handleToggleSlot(id);
          }}
          selectedSlotId={selectedSlotId}
        />

        {/* Common Buzzer Indicator (Animated 1, 2, 3 pulses + D8 pin status) */}
        <BuzzerIndicator
          buzzerState={buzzerState}
          onTriggerPulse={triggerBuzzer}
          onToggleAudio={handleToggleAudio}
        />

        {/* Live Slot Cards (Distance cm, FSR reading, HC-SR04 pinout, Threshold indicators) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onToggleStatus={handleToggleSlot}
              onUpdateSensorValues={handleUpdateSensorValues}
              isDemoMode={connectionMode === 'demo'}
            />
          ))}
        </div>

        {/* Arduino Serial Monitor Console */}
        <SerialConsole
          logs={logs}
          connectionMode={connectionMode}
          onClearLogs={() => setLogs([])}
          onSendSerialCommand={(cmd) => handleIncomingSerialLine(cmd)}
          isBrowserSupported={isBrowserSupported}
          errorMessage={errorMessage}
        />
      </main>

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <span>Smart Parking System · Arduino Uno (HC-SR04 D2-D7, FSR A0-A2, Buzzer D8, MG995 D11) · 9600 Baud</span>
      </footer>

      {/* Arduino Firmware & Wiring Guide Modal */}
      <ArduinoGuideModal
        isOpen={isArduinoGuideOpen}
        onClose={() => setIsArduinoGuideOpen(false)}
      />
    </div>
  );
}
