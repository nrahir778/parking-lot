// Web Bluetooth Service for HC-05 / Serial Bluetooth modules

interface BluetoothDeviceWithGatt extends EventTarget {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
  };
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  getPrimaryService(service: string | number): Promise<BluetoothRemoteGATTService>;
  getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
  disconnect(): void;
}

interface BluetoothRemoteGATTService {
  uuid: string;
  getCharacteristic(characteristic: string | number): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  uuid: string;
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

// Common Bluetooth Serial / UART Service UUIDs
const UART_SERVICE_UUIDS = [
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Standard HC-05 / CC2541 / HM-10 UART
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
  '00001101-0000-1000-8000-00805f9b34fb', // Standard Serial Port Profile (SPP)
  0xffe0,
  0xffe1,
];

export class HC05BluetoothManager {
  private device: BluetoothDeviceWithGatt | null = null;
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onLineReceivedCallback: ((line: string) => void) | null = null;
  private onDisconnectCallback: ((error?: Error) => void) | null = null;
  private buffer = '';

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'bluetooth' in navigator;
  }

  public setCallbacks(
    onLine: (line: string) => void,
    onDisconnect: (error?: Error) => void
  ) {
    this.onLineReceivedCallback = onLine;
    this.onDisconnectCallback = onDisconnect;
  }

  public getDeviceName(): string {
    return this.device?.name || 'HC-05 Bluetooth';
  }

  public async connect(): Promise<boolean> {
    if (!HC05BluetoothManager.isSupported()) {
      throw new Error(
        'Web Bluetooth is not supported in this browser. To connect HC-05 on Windows 11, pair HC-05 in Windows Settings (PIN: 1234), then use "Connect USB / Bluetooth COM"!'
      );
    }

    try {
      const nav = navigator as unknown as {
        bluetooth: {
          requestDevice(options: {
            filters?: Array<{ name?: string; namePrefix?: string; services?: Array<string | number> }>;
            optionalServices?: Array<string | number>;
            acceptAllDevices?: boolean;
          }): Promise<BluetoothDeviceWithGatt>;
        };
      };

      // Request HC-05 or any serial Bluetooth device
      this.device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
          '00001101-0000-1000-8000-00805f9b34fb',
          0xffe0,
          0xffe1,
        ],
      });

      if (!this.device.gatt) {
        throw new Error('Device does not support GATT connection.');
      }

      this.device.addEventListener('gattserverdisconnected', () => {
        this.cleanup();
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }
      });

      const server = await this.device.gatt.connect();

      // Find UART service & characteristic
      let service: BluetoothRemoteGATTService | null = null;
      for (const uuid of UART_SERVICE_UUIDS) {
        try {
          service = await server.getPrimaryService(uuid);
          if (service) break;
        } catch {
          // continue checking next service
        }
      }

      if (!service) {
        // Fallback: query all primary services
        const services = await server.getPrimaryServices();
        if (services.length > 0) {
          service = services[0];
        }
      }

      if (!service) {
        throw new Error('Could not find compatible UART / Serial service on HC-05 device.');
      }

      const characteristics = await service.getCharacteristics();
      // Look for characteristic that supports notify or indicate
      this.rxCharacteristic = characteristics[0];

      if (this.rxCharacteristic) {
        await this.rxCharacteristic.startNotifications();
        this.rxCharacteristic.addEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged.bind(this)
        );
      }

      return true;
    } catch (err: unknown) {
      this.cleanup();
      throw err;
    }
  }

  private handleCharacteristicValueChanged(event: Event) {
    const target = event.target as unknown as { value?: DataView };
    if (!target?.value) return;

    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(target.value);
    this.buffer += text;

    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const clean = line.trim();
      if (clean && this.onLineReceivedCallback) {
        this.onLineReceivedCallback(clean);
      }
    }
  }

  public disconnect(): void {
    try {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
    } catch (err) {
      console.warn('Bluetooth disconnect error:', err);
    } finally {
      this.cleanup();
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    }
  }

  public isConnected(): boolean {
    return !!this.device?.gatt?.connected;
  }

  private cleanup() {
    this.device = null;
    this.rxCharacteristic = null;
    this.buffer = '';
  }
}

export const hc05Bluetooth = new HC05BluetoothManager();
