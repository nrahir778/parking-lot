import React, { useState, useEffect, useCallback } from 'react';
import {
  SlotData,
  ConnectionMode,
  BuzzerState,
  SerialLogEntry,
  SlotId,
  GateState,
  ThemeMode,
  ArduinoSummaryData,
} from './types';
import { HeaderBar } from './components/HeaderBar';
import { TopSummary } from './components/TopSummary';
import { IsometricParkingLot } from './components/IsometricParkingLot';
import { BuzzerIndicator } from './components/BuzzerIndicator';
import { SlotCard } from './components/SlotCard';
import { SerialConsole } from './components/SerialConsole';
import { ArduinoGuideModal } from './components/ArduinoGuideModal';
import { BluetoothConnectModal } from './components/BluetoothConnectModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { PermissionPromptModal } from './components/PermissionPromptModal';
import { InAppToastContainer } from './components/InAppToastContainer';
import { notificationService } from './services/notificationService';
import { downloadArduinoInoFile } from './utils/downloadFirmware';
import {
  serialManager,
  SerialLineParser,
  ArduinoSerialManager,
} from './services/webSerial';
import { hc05Bluetooth, HC05BluetoothManager } from './services/webBluetooth';
import { buzzerAudio } from './services/audioBuzzer';

const INITIAL_SLOTS: SlotData[] = [
  {
    id: 1,
    name: 'LOT 1',
    status: 'UNKNOWN',
    distance: 0.0,
    unit: 'cm',
    pressure: 0,
    fsr: 0,
    lastUpdated: 0,
    hasHardwareReading: false,
    car: {
      bodyColor: '#2563eb', // Royal Blue
      roofColor: '#1d4ed8',
      accentColor: '#60a5fa',
      modelName: 'Normal Sedan',
      plate: 'GJ-01-A1',
    },
  },
  {
    id: 2,
    name: 'LOT 2',
    status: 'UNKNOWN',
    distance: 0.0,
    unit: 'cm',
    pressure: 0,
    fsr: 0,
    lastUpdated: 0,
    hasHardwareReading: false,
    car: {
      bodyColor: '#475569', // Slate Gray
      roofColor: '#334155',
      accentColor: '#94a3b8',
      modelName: 'Compact Car',
      plate: 'GJ-05-B2',
    },
  },
  {
    id: 3,
    name: 'LOT 3',
    status: 'UNKNOWN',
    distance: 0.0,
    unit: 'cm',
    pressure: 0,
    fsr: 0,
    lastUpdated: 0,
    hasHardwareReading: false,
    car: {
      bodyColor: '#dc2626', // Classic Red
      roofColor: '#b91c1c',
      accentColor: '#f87171',
      modelName: 'Hatchback',
      plate: 'GJ-18-C3',
    },
  },
];

export default function App() {
  const [slots, setSlots] = useState<SlotData[]>(INITIAL_SLOTS);
  const [arduinoSummary, setArduinoSummary] = useState<ArduinoSummaryData | null>(null);
  const [lastDataReceivedAt, setLastDataReceivedAt] = useState<number | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('disconnected');
  const [theme, setTheme] = useState<ThemeMode>('light'); // User requested light theme
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<SerialLogEntry[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(undefined);
  const [isArduinoGuideOpen, setIsArduinoGuideOpen] = useState(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPermissionPromptOpen, setIsPermissionPromptOpen] = useState(false);
  const [portLabel, setPortLabel] = useState<string | undefined>(undefined);
  const [isParkingLotFullscreen, setIsParkingLotFullscreen] = useState(false);

  // Check on first app launch if permissions were granted
  useEffect(() => {
    try {
      const alreadyGranted = localStorage.getItem('smartparking_permissions_granted');
      if (!alreadyGranted) {
        const timer = setTimeout(() => {
          setIsPermissionPromptOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Manage body overflow when in fullscreen mode
  useEffect(() => {
    if (isParkingLotFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isParkingLotFullscreen]);

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

  // Manage dark/light class on HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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

      addLog(`[BUZZER] Alert: ${pulseCount} pulse(s)`, 'buzzer');

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

  // Helper to sync Gate Servo and Buzzer state from slot conditions
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

  // Process incoming line from Arduino hardware (USB or HC-05 Bluetooth)
  const handleIncomingSerialLine = useCallback(
    (rawLine: string) => {
      const clean = rawLine.trim();
      if (!clean) return;

      addLog(clean, 'incoming');

      const parsed = SerialLineParser.parse(clean);

      // 0. Ignore divider lines, blank lines, startup banners
      if (parsed.type === 'ignored') {
        return;
      }

      // 1. Individual Lot / Slot reading line
      // e.g. "Lot 1 | Distance: 3.1 cm | Status: EMPTY"
      if (parsed.type === 'slot') {
        const { slotId, distance, unit, status, fsr } = parsed.data;
        setLastDataReceivedAt(Date.now());

        setSlots((currentSlots) => {
          const prevSlot = currentSlots.find((s) => s.id === slotId);
          const wasEmpty = prevSlot ? (prevSlot.status === 'EMPTY' || prevSlot.status === 'AVAILABLE') : false;

          // If a slot transitions to OCCUPIED, trigger buzzer pulse & useful notification
          if (wasEmpty && status === 'OCCUPIED') {
            triggerBuzzer(slotId);
            const occupiedCount = currentSlots.filter((s) => (s.id === slotId ? true : s.status === 'OCCUPIED')).length;
            notificationService.notifyVehicleParked(slotId, occupiedCount);
          } else if (prevSlot?.status === 'OCCUPIED' && (status === 'EMPTY' || status === 'AVAILABLE')) {
            const freeCount = currentSlots.filter((s) => (s.id === slotId ? true : (s.status === 'EMPTY' || s.status === 'AVAILABLE'))).length;
            notificationService.notifySpotAvailable(slotId, freeCount);
          }

          // Update individual slot card as its line arrives. Do not reset other cards!
          return currentSlots.map((slot) => {
            if (slot.id === slotId) {
              return {
                ...slot,
                status,
                distance,
                unit: unit || 'cm',
                pressure: fsr ?? slot.pressure,
                fsr: fsr ?? slot.fsr,
                lastUpdated: Date.now(),
                hasHardwareReading: true,
              };
            }
            return slot;
          });
        });
      }
      // 2. Total Summary line
      // e.g. "TOTAL OCCUPIED: 1/3 | EMPTY: 2 | UNKNOWN: 0 | AVAILABLE: 2 | GATE: OPEN"
      else if (parsed.type === 'summary') {
        setLastDataReceivedAt(Date.now());
        setArduinoSummary({
          ...parsed.data,
          lastUpdated: Date.now(),
        });

        // Arduino is the source of truth for Gate Status
        const isClosed = parsed.data.gate === 'CLOSED';
        setGateState({
          angle: isClosed ? 90 : 0,
          status: parsed.data.gate,
        });

        // Set Hardware Buzzer State
        const allOccupied = parsed.data.totalOccupied >= parsed.data.totalSlots;
        if (allOccupied) {
          notificationService.notifyParkingFull();
        }
        setBuzzerState((prev) => ({
          ...prev,
          hardwareBuzzerOn: allOccupied || isClosed,
        }));
      }
      // 3. Standalone Gate / Buzzer status lines
      else if (parsed.type === 'gate_buzzer') {
        setLastDataReceivedAt(Date.now());
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
    [addLog, triggerBuzzer]
  );

  // Check Web Serial and Web Bluetooth support on mount
  useEffect(() => {
    const supported = ArduinoSerialManager.isSupported() || HC05BluetoothManager.isSupported();
    setIsBrowserSupported(supported);
  }, []);

  // Connect via USB Cable (9600 Baud)
  const handleConnectUSB = async () => {
    setErrorMessage(null);
    try {
      setConnectionMode('connecting');
      addLog('[SYSTEM] Opening USB Serial connection at 9600 baud...', 'system');

      serialManager.setCallbacks(
        (line) => {
          handleIncomingSerialLine(line);
        },
        (error) => {
          if (error) {
            addLog(`[ERROR] USB Serial disconnected: ${error.message}`, 'error');
            setErrorMessage(error.message);
          } else {
            addLog('[SYSTEM] USB Serial disconnected cleanly.', 'system');
          }
          setConnectionMode('disconnected');
          setPortLabel(undefined);
        }
      );

      await serialManager.connect(9600);
      const portInfo = serialManager.getPortInfo();
      const detectedLabel = portInfo?.label || 'Arduino Uno (USB)';
      setPortLabel(detectedLabel);
      setConnectionMode('connected_usb');
      addLog(`[SYSTEM] Connected to ${detectedLabel} @ 9600 baud. Receiving live hardware data.`, 'system');
      notificationService.notifyHardwareConnected(detectedLabel);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'USB connection failed.';
      setErrorMessage(msg);
      addLog(`[SYSTEM] USB Connection aborted: ${msg}`, 'error');
      setConnectionMode('disconnected');
      setPortLabel(undefined);
    }
  };

  // Connect via HC-05 Bluetooth Module (Native Capacitor BLE or Web Bluetooth)
  const handleConnectBluetooth = async (targetDeviceId?: string) => {
    setErrorMessage(null);
    try {
      setConnectionMode('connecting');
      addLog('[SYSTEM] Opening HC-05 Bluetooth connection...', 'system');

      hc05Bluetooth.setCallbacks(
        (line) => {
          handleIncomingSerialLine(line);
        },
        (error) => {
          if (error) {
            addLog(`[ERROR] Bluetooth disconnected: ${error.message}`, 'error');
            setErrorMessage(error.message);
            notificationService.notifyHardwareDisconnected(error.message);
          } else {
            addLog('[SYSTEM] Bluetooth disconnected.', 'system');
            notificationService.notifyHardwareDisconnected();
          }
          setConnectionMode('disconnected');
          setPortLabel(undefined);
        }
      );

      await hc05Bluetooth.connect(targetDeviceId);
      const devName = hc05Bluetooth.getDeviceName();
      setPortLabel(devName);
      setConnectionMode('connected_bt');
      addLog(`[SYSTEM] Connected to ${devName} wirelessly. Receiving live hardware data.`, 'system');
      notificationService.notifyHardwareConnected(devName);
      setIsBluetoothModalOpen(false);
    } catch (err: unknown) {
      // Fallback for Windows 11 Classic HC-05 SPP paired COM port
      try {
        serialManager.setCallbacks(
          (line) => {
            handleIncomingSerialLine(line);
          },
          (error) => {
            if (error) {
              addLog(`[ERROR] Bluetooth COM disconnected: ${error.message}`, 'error');
              setErrorMessage(error.message);
              notificationService.notifyHardwareDisconnected(error.message);
            } else {
              addLog('[SYSTEM] Bluetooth COM disconnected.', 'system');
              notificationService.notifyHardwareDisconnected();
            }
            setConnectionMode('disconnected');
            setPortLabel(undefined);
          }
        );

        await serialManager.connect(9600);
        setPortLabel('HC-05 (Bluetooth COM @ 9600)');
        setConnectionMode('connected_bt');
        addLog('[SYSTEM] Connected to HC-05 via Bluetooth COM port @ 9600 baud.', 'system');
        notificationService.notifyHardwareConnected('HC-05 Bluetooth COM');
        setIsBluetoothModalOpen(false);
        return;
      } catch {
        // Fallback did not apply
      }

      const msg = err instanceof Error ? err.message : 'Bluetooth connection failed.';
      setErrorMessage(msg);
      addLog(`[SYSTEM] Bluetooth Connection aborted: ${msg}`, 'error');
      setConnectionMode('disconnected');
      setPortLabel(undefined);
      throw err;
    }
  };

  const handleInjectSampleData = () => {
    addLog('[TEST] Injected Arduino Uno telemetry stream', 'system');
    handleIncomingSerialLine('Lot 1 | Distance: 3.1 cm | Status: EMPTY');
    handleIncomingSerialLine('Lot 2 | Distance: 2.3 cm | Status: OCCUPIED');
    handleIncomingSerialLine('Lot 3 | Distance: 4.1 cm | Status: EMPTY');
    handleIncomingSerialLine('TOTAL OCCUPIED: 1/3 | EMPTY: 2 | UNKNOWN: 0 | AVAILABLE: 2 | GATE: OPEN');
  };

  const handleDisconnect = async () => {
    try {
      if (connectionMode === 'connected_usb') {
        await serialManager.disconnect();
      } else if (connectionMode === 'connected_bt') {
        if (hc05Bluetooth.isConnected()) {
          hc05Bluetooth.disconnect();
        } else {
          await serialManager.disconnect();
        }
      }
      setConnectionMode('disconnected');
      setPortLabel(undefined);
      notificationService.notifyHardwareDisconnected();
      addLog('[SYSTEM] Disconnected from hardware.', 'system');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error closing connection';
      addLog(`[ERROR] ${msg}`, 'error');
    }
  };

  const handleToggleAudio = () => {
    const nextState = !buzzerState.audioEnabled;
    buzzerAudio.setMuted(!nextState);
    setBuzzerState((prev) => ({ ...prev, audioEnabled: nextState }));
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isLight
          ? 'bg-slate-100 text-slate-900 selection:bg-cyan-500/20'
          : 'bg-[#080c14] text-slate-100 selection:bg-cyan-500/20'
      }`}
    >
      {/* Clean Top Header Bar */}
      <HeaderBar
        connectionMode={connectionMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        onConnectUSB={handleConnectUSB}
        onConnectBluetooth={() => setIsBluetoothModalOpen(true)}
        onDisconnect={handleDisconnect}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        portLabel={portLabel}
        isFullscreen={isParkingLotFullscreen}
        onToggleFullscreen={() => setIsParkingLotFullscreen((prev) => !prev)}
      />

      {/* In-App Live Notification Toast HUD */}
      <InAppToastContainer isLightMode={isLight} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Top Summary Bar */}
        <TopSummary
          slots={slots}
          arduinoSummary={arduinoSummary}
          gateState={gateState}
          hardwareBuzzerOn={buzzerState.hardwareBuzzerOn}
          connectionMode={connectionMode}
          portLabel={portLabel}
          isLightMode={isLight}
          lastDataReceivedAt={lastDataReceivedAt}
          onConnectBluetooth={() => setIsBluetoothModalOpen(true)}
        />

        {/* 3D Isometric Parking Yard (Realistic, Simple Normal Cars, Light & Dark Theme) */}
        <IsometricParkingLot
          slots={slots}
          gateState={gateState}
          hardwareBuzzerOn={buzzerState.hardwareBuzzerOn}
          onSlotClick={(id) => {
            setSelectedSlotId(id);
          }}
          selectedSlotId={selectedSlotId}
          isLightMode={isLight}
          isFullscreen={isParkingLotFullscreen}
          onToggleFullscreen={(val) => setIsParkingLotFullscreen(val)}
        />

        {/* Common Buzzer Indicator (Animated 1, 2, 3 pulses + D8 pin status) */}
        <BuzzerIndicator
          buzzerState={buzzerState}
          onTriggerPulse={triggerBuzzer}
          onToggleAudio={handleToggleAudio}
          isLightMode={isLight}
        />

        {/* Live Slot Cards (Distance cm, FSR reading, HC-SR04 pinout, Threshold indicators) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} isLightMode={isLight} />
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
          isLightMode={isLight}
        />
      </main>

      {/* Clean, Minimal Footer */}
      <footer
        className={`w-full border-t py-3.5 px-4 text-center text-xs font-mono transition-colors ${
          isLight ? 'border-slate-200 text-slate-500 bg-white' : 'border-slate-800/80 text-slate-500 bg-[#080c14]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>Smart Parking · શ્રી સરકારી માધ્યમિક શાળા લાખાપર</span>
          <span className="opacity-30">·</span>
          <button
            onClick={() => downloadArduinoInoFile()}
            className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-bold"
          >
            📥 Download Arduino Firmware (.ino)
          </button>
          <span className="opacity-30">·</span>
          <button
            onClick={() => setIsArduinoGuideOpen(true)}
            className="text-slate-500 hover:text-slate-400 hover:underline cursor-pointer"
          >
            Wiring Diagram
          </button>
        </div>
      </footer>

      {/* First Launch Permissions Onboarding Modal */}
      <PermissionPromptModal
        isOpen={isPermissionPromptOpen}
        onClose={() => setIsPermissionPromptOpen(false)}
        isLightMode={isLight}
      />

      {/* Arduino Firmware & Wiring Guide Modal */}
      <ArduinoGuideModal
        isOpen={isArduinoGuideOpen}
        onClose={() => setIsArduinoGuideOpen(false)}
        isLightMode={isLight}
      />

      {/* Interactive Bluetooth Connect & Pairing Modal */}
      <BluetoothConnectModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        connectionMode={connectionMode}
        portLabel={portLabel}
        onConnectBluetooth={handleConnectBluetooth}
        onDisconnect={handleDisconnect}
        onConnectUSB={handleConnectUSB}
        onInjectTestStream={handleInjectSampleData}
        isLightMode={isLight}
      />

      {/* Useful Notification Settings & Device Permissions Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isLightMode={isLight}
      />
    </div>
  );
}
