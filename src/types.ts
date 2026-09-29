export type SlotId = 1 | 2 | 3;
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED';

export interface CarVisualConfig {
  bodyColor: string;
  roofColor: string;
  accentColor: string;
  modelName: string;
  plate: string;
}

export interface SlotData {
  id: SlotId;
  name: string;
  status: SlotStatus;
  distance: number; // in cm (from HC-SR04)
  pressure: number; // 0 - 1023 (FSR analog reading)
  fsr: number; // 0 - 1023 (FSR analog reading on A0, A1, A2)
  lastUpdated: number; // timestamp
  car: CarVisualConfig;
  hasHardwareReading: boolean;
}

export type ConnectionMode = 'disconnected' | 'connecting' | 'connected' | 'demo';

export interface GateState {
  angle: number; // 0 (Open) to 90 (Closed)
  status: 'OPEN' | 'CLOSED';
}

export interface BuzzerState {
  active: boolean;
  pulseCount: 1 | 2 | 3;
  currentPulse: number;
  audioEnabled: boolean;
  lastTriggered: number;
  hardwareBuzzerOn: boolean; // D8 status on Arduino Uno
}

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  line: string;
  type: 'incoming' | 'system' | 'buzzer' | 'error';
}

export type CameraView = 'isometric' | 'topdown' | 'driver';

export interface ArduinoPortDetails {
  usbVendorId?: number;
  usbProductId?: number;
  portLabel?: string;
}
