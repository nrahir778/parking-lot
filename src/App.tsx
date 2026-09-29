import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SlotData,
  ConnectionMode,
  BuzzerState,
  SerialLogEntry,
  SlotId,
} from './types';
import { HeaderBar } from './components/HeaderBar';
import { TopSummary } from './components/TopSummary';
import { IsometricParkingLot } from './components/IsometricParkingLot';
import { BuzzerIndicator } from './components/BuzzerIndicator';
import { SlotCard } from './components/SlotCard';
import { SerialConsole } from './components/SerialConsole';
import {
  serialManager,
  SerialLineParser,
  ArduinoSerialManager,
} from './services/webSerial';
import { buzzerAudio } from './services/audioBuzzer';
import { exportStandaloneHtmlFile } from './utils/exportSingleFileHtml';

const INITIAL_SLOTS: SlotData[] = [
  {
    id: 1,
    name: 'SLOT 1',
    status: 'AVAILABLE',
    distance: 45.2,
    pressure: 14,
    lastUpdated: Date.now(),
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
    status: 'OCCUPIED',
    distance: 2.5,
    pressure: 500,
    lastUpdated: Date.now(),
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
    distance: 48.6,
    pressure: 9,
    lastUpdated: Date.now(),
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
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('demo');
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<SerialLogEntry[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(undefined);

  // Buzzer State
  const [buzzerState, setBuzzerState] = useState<BuzzerState>({
    active: false,
    pulseCount: 1,
    currentPulse: 0,
    audioEnabled: true,
    lastTriggered: 0,
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
      setLogs((prev) => [...prev.slice(-140), entry]);
    },
    []
  );

  // Trigger Arduino Buzzer Pulse Pattern (1, 2, or 3 pulses)
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

      // Reset buzzer state back to idle after sequence finishes
      setBuzzerState((prev) => ({
        ...prev,
        active: false,
        currentPulse: 0,
      }));
    },
    [addLog]
  );

  // Process incoming line from Arduino serial or demo simulator
  const handleIncomingSerialLine = useCallback(
    (rawLine: string) => {
      addLog(rawLine, 'incoming');

      const parsed = SerialLineParser.parse(rawLine);

      if (parsed.type === 'slot') {
        const { slotId, distance, pressure, status } = parsed.data;

        setSlots((currentSlots) => {
          const prevSlot = currentSlots.find((s) => s.id === slotId);
          const wasAvailable = prevSlot ? prevSlot.status === 'AVAILABLE' : false;

          // If a slot transitions from AVAILABLE -> OCCUPIED, trigger corresponding buzzer pulses!
          // Arduino pattern: Slot 1 -> 1 pulse, Slot 2 -> 2 pulses, Slot 3 -> 3 pulses
          if (wasAvailable && status === 'OCCUPIED') {
            triggerBuzzer(slotId);
          }

          return currentSlots.map((slot) => {
            if (slot.id === slotId) {
              return {
                ...slot,
                status,
                distance,
                pressure,
                lastUpdated: Date.now(),
              };
            }
            return slot;
          });
        });
      } else if (parsed.type === 'buzzer') {
        triggerBuzzer(parsed.data.pulseCount);
      }
    },
    [addLog, triggerBuzzer]
  );

  // Toggle single slot status (Park vehicle / Vacate slot)
  const handleToggleSlot = useCallback(
    (slotId: SlotId) => {
      setSlots((currentSlots) => {
        return currentSlots.map((slot) => {
          if (slot.id === slotId) {
            const willBeOccupied = slot.status !== 'OCCUPIED';
            const newStatus = willBeOccupied ? 'OCCUPIED' : 'AVAILABLE';
            const newDist = willBeOccupied
              ? parseFloat((1.5 + Math.random() * 3).toFixed(1))
              : parseFloat((42.0 + Math.random() * 7).toFixed(1));
            const newPressure = willBeOccupied
              ? Math.floor(450 + Math.random() * 200)
              : Math.floor(5 + Math.random() * 15);

            // Log exact Arduino formatted line
            const formattedLine = `SLOT ${slotId} | Distance: ${newDist.toFixed(1)} cm | Pressure: ${newPressure} | STATUS: ${newStatus}`;
            addLog(formattedLine, 'incoming');

            if (willBeOccupied) {
              triggerBuzzer(slotId);
            }

            return {
              ...slot,
              status: newStatus,
              distance: newDist,
              pressure: newPressure,
              lastUpdated: Date.now(),
            };
          }
          return slot;
        });
      });
    },
    [addLog, triggerBuzzer]
  );

  // Manual sensor value adjustment (distance & pressure sliders in Demo Mode)
  const handleUpdateSensorValues = useCallback(
    (slotId: SlotId, distance: number, pressure: number) => {
      setSlots((currentSlots) => {
        return currentSlots.map((slot) => {
          if (slot.id === slotId) {
            // Threshold logic: distance < 10cm or pressure > 200 => OCCUPIED
            const isOccupied = distance < 10 || pressure > 200;
            const newStatus = isOccupied ? 'OCCUPIED' : 'AVAILABLE';

            if (slot.status === 'AVAILABLE' && newStatus === 'OCCUPIED') {
              triggerBuzzer(slotId);
            }

            return {
              ...slot,
              distance,
              pressure,
              status: newStatus,
              lastUpdated: Date.now(),
            };
          }
          return slot;
        });
      });
    },
    [triggerBuzzer]
  );

  // Check Web Serial support on mount
  useEffect(() => {
    const supported = ArduinoSerialManager.isSupported();
    setIsBrowserSupported(supported);
  }, []);

  // Demo Mode Traffic Generator: Simulates vehicles entering and exiting
  useEffect(() => {
    if (connectionMode === 'demo') {
      addLog('[SYSTEM] Demo Mode activated. Simulating ultrasonic & pressure telemetry.', 'system');

      demoIntervalRef.current = setInterval(() => {
        // Pick a random slot to toggle or fluctuate
        const randomSlotId = (Math.floor(Math.random() * 3) + 1) as SlotId;
        setSlots((currentSlots) => {
          const target = currentSlots.find((s) => s.id === randomSlotId);
          if (!target) return currentSlots;

          const willBeOccupied = target.status !== 'OCCUPIED';
          const newStatus = willBeOccupied ? 'OCCUPIED' : 'AVAILABLE';
          const newDist = willBeOccupied
            ? parseFloat((1.8 + Math.random() * 2.8).toFixed(1))
            : parseFloat((43.0 + Math.random() * 6).toFixed(1));
          const newPressure = willBeOccupied
            ? Math.floor(480 + Math.random() * 180)
            : Math.floor(6 + Math.random() * 12);

          const formattedLine = `SLOT ${randomSlotId} | Distance: ${newDist.toFixed(1)} cm | Pressure: ${newPressure} | STATUS: ${newStatus}`;
          addLog(formattedLine, 'incoming');

          if (willBeOccupied) {
            triggerBuzzer(randomSlotId);
          }

          return currentSlots.map((s) =>
            s.id === randomSlotId
              ? {
                  ...s,
                  status: newStatus,
                  distance: newDist,
                  pressure: newPressure,
                  lastUpdated: Date.now(),
                }
              : s
          );
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
  }, [connectionMode, addLog, triggerBuzzer]);

  // Connect to Arduino Uno through Chrome/Edge Web Serial API at 9600 baud
  const handleConnectSerial = async () => {
    setErrorMessage(null);
    if (!isBrowserSupported) {
      setErrorMessage(
        'Web Serial API is not supported in this browser. Please use Chrome or Edge desktop, or continue in Demo Mode.'
      );
      return;
    }

    try {
      setConnectionMode('connecting');
      addLog('[SYSTEM] Requesting Web Serial port for Arduino Uno at 9600 baud...', 'system');

      serialManager.setCallbacks(
        (line) => {
          handleIncomingSerialLine(line);
        },
        (error) => {
          if (error) {
            addLog(`[ERROR] Serial disconnected: ${error.message}`, 'error');
            setErrorMessage(error.message);
          } else {
            addLog('[SYSTEM] Arduino Serial disconnected.', 'system');
          }
          setConnectionMode('disconnected');
        }
      );

      await serialManager.connect(9600);
      setConnectionMode('connected');
      addLog('[SYSTEM] Connected to Arduino Uno at 9600 baud. Receiving real-time telemetry.', 'system');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User cancelled port selection or connection failed.';
      setErrorMessage(msg);
      addLog(`[SYSTEM] Connection aborted: ${msg}`, 'error');
      setConnectionMode('demo'); // Gracefully fallback to Demo Mode
    }
  };

  const handleDisconnectSerial = async () => {
    try {
      await serialManager.disconnect();
      setConnectionMode('disconnected');
      addLog('[SYSTEM] Disconnected from serial port.', 'system');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error closing port';
      addLog(`[ERROR] ${msg}`, 'error');
    }
  };

  const handleToggleDemo = () => {
    if (connectionMode === 'demo') {
      setConnectionMode('disconnected');
      addLog('[SYSTEM] Demo Mode stopped.', 'system');
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
        isBrowserSupported={isBrowserSupported}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Top Summary Bar */}
        <TopSummary slots={slots} />

        {/* 3D Isometric Parking Lot (Main Visual Anchor) */}
        <IsometricParkingLot
          slots={slots}
          onSlotClick={(id) => {
            setSelectedSlotId(id);
            handleToggleSlot(id);
          }}
          selectedSlotId={selectedSlotId}
        />

        {/* Common Buzzer Indicator (Animated 1, 2, 3 pulses) */}
        <BuzzerIndicator
          buzzerState={buzzerState}
          onTriggerPulse={triggerBuzzer}
          onToggleAudio={handleToggleAudio}
        />

        {/* Live Slot Cards (Distance, Pressure, Status) */}
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

      {/* Clean Footer (Quiet, anti-slop, no hallucinated cockpit scoreboards) */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <span>Smart Parking 3D Telemetry System · Chrome/Edge Web Serial at 9600 Baud · Arduino Uno Protocol</span>
      </footer>
    </div>
  );
}
