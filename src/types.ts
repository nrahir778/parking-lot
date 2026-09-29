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
  distance: number; // in cm
  pressure: number; // 0 - 1023
  lastUpdated: number; // timestamp
  car: CarVisualConfig;
}

export type ConnectionMode = 'disconnected' | 'connecting' | 'connected' | 'demo';

export interface BuzzerState {
  active: boolean;
  pulseCount: 1 | 2 | 3;
  currentPulse: number;
  audioEnabled: boolean;
  lastTriggered: number;
}

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  line: string;
  type: 'incoming' | 'system' | 'buzzer' | 'error';
}

export type CameraView = 'isometric' | 'topdown' | 'driver';
