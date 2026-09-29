export interface ParsedSlotData {
  slotId: 1 | 2 | 3;
  distance: number;
  fsr: number;
  status: 'OCCUPIED' | 'AVAILABLE';
  raw: string;
}

export interface ParsedGateBuzzerData {
  gateAngle?: number; // 0 or 90
  gateStatus?: 'OPEN' | 'CLOSED';
  buzzerOn?: boolean;
  pulseCount?: 1 | 2 | 3;
  raw: string;
}

export type SerialParseResult =
  | { type: 'slot'; data: ParsedSlotData }
  | { type: 'gate_buzzer'; data: ParsedGateBuzzerData }
  | { type: 'unknown'; raw: string };

export class SerialLineParser {
  /**
   * Expected formats from Arduino:
   * 1. SLOT 1 | Distance: 2.5 cm | FSR: 45 | STATUS: OCCUPIED
   * 2. SLOT 2 | Distance: 15.0 cm | Pressure: 0 | STATUS: AVAILABLE
   * 3. GATE: 90 deg | BUZZER: ON  (or GATE: 0 deg | BUZZER: OFF)
   * 4. BUZZER: 1 / 2 / 3
   */
  public static parse(line: string): SerialParseResult {
    const trimmed = line.trim();
    if (!trimmed) return { type: 'unknown', raw: line };

    // 1. Check for Gate and Buzzer telemetry line:
    // e.g. "GATE: 90 deg | BUZZER: ON", "GATE: 0 | BUZZER: OFF", "GATE: 90", "SERVO: 90"
    const gateMatch = trimmed.match(/(?:GATE|SERVO)[:\s]+(\d+)/i);
    const buzzerStateMatch = trimmed.match(/BUZZER[:\s]+(ON|OFF|HIGH|LOW)/i);
    const buzzerPulseMatch = trimmed.match(/(?:BUZZER|BEEP)[:\s]+([1-3])\b/i);

    if (gateMatch || buzzerStateMatch || buzzerPulseMatch) {
      const gateAngle = gateMatch ? parseInt(gateMatch[1], 10) : undefined;
      const gateStatus = gateAngle !== undefined ? (gateAngle >= 45 ? 'CLOSED' : 'OPEN') : undefined;

      let buzzerOn: boolean | undefined = undefined;
      if (buzzerStateMatch) {
        const val = buzzerStateMatch[1].toUpperCase();
        buzzerOn = val === 'ON' || val === 'HIGH';
      }

      const pulseCount = buzzerPulseMatch ? (parseInt(buzzerPulseMatch[1], 10) as 1 | 2 | 3) : undefined;

      return {
        type: 'gate_buzzer',
        data: {
          gateAngle,
          gateStatus,
          buzzerOn,
          pulseCount,
          raw: trimmed,
        },
      };
    }

    // 2. Main Slot pattern with FSR or Pressure:
    // SLOT 1 | Distance: 2.5 cm | FSR: 50 | STATUS: OCCUPIED
    // SLOT 1 | Distance: 2.5 cm | Pressure: 500 | STATUS: OCCUPIED
    const mainRegex = /SLOT\s*([1-3])\s*\|\s*Dist(?:ance)?:\s*([\d.]+)\s*cm\s*\|\s*(?:FSR|Pressure):\s*(\d+)\s*\|\s*STATUS:\s*(OCCUPIED|AVAILABLE|VACANT)/i;
    const match = trimmed.match(mainRegex);

    if (match) {
      const slotNum = parseInt(match[1], 10);
      const slotId = (slotNum >= 1 && slotNum <= 3 ? slotNum : 1) as 1 | 2 | 3;
      const distance = parseFloat(match[2]);
      const fsr = parseInt(match[3], 10);
      const rawStatus = match[4].toUpperCase();
      const status: 'OCCUPIED' | 'AVAILABLE' = rawStatus === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE';

      return {
        type: 'slot',
        data: {
          slotId,
          distance,
          fsr,
          status,
          raw: trimmed,
        },
      };
    }

    // 3. Flexible fallback parser if spacing/delimiters differ slightly
    if (/SLOT\s*[1-3]/i.test(trimmed)) {
      const slotMatch = trimmed.match(/SLOT\s*([1-3])/i);
      const distMatch = trimmed.match(/(?:Distance|Dist):\s*([\d.]+)/i);
      const fsrMatch = trimmed.match(/(?:FSR|Pressure):\s*(\d+)/i);
      const statMatch = trimmed.match(/STATUS:\s*(OCCUPIED|AVAILABLE|VACANT)/i);

      if (slotMatch) {
        const slotId = parseInt(slotMatch[1], 10) as 1 | 2 | 3;
        const distance = distMatch ? parseFloat(distMatch[1]) : 0;
        const fsr = fsrMatch ? parseInt(fsrMatch[1], 10) : 0;

        // Hardware specification: distance <= 3.0 cm AND FSR >= 15 => OCCUPIED
        let status: 'OCCUPIED' | 'AVAILABLE';
        if (statMatch) {
          status = statMatch[1].toUpperCase() === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE';
        } else {
          status = (distance <= 3.0 && fsr >= 15) ? 'OCCUPIED' : 'AVAILABLE';
        }

        return {
          type: 'slot',
          data: {
            slotId,
            distance,
            fsr,
            status,
            raw: trimmed,
          },
        };
      }
    }

    return { type: 'unknown', raw: trimmed };
  }
}

// Web Serial API types declaration
interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<any> | null;
  writable: WritableStream<any> | null;
  getInfo(): SerialPortInfo;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface SerialNavigator {
  serial?: {
    requestPort(options?: unknown): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  };
}

export class ArduinoSerialManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private keepReading = false;
  private onLineReceivedCallback: ((line: string) => void) | null = null;
  private onDisconnectCallback: ((error?: Error) => void) | null = null;

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const nav = navigator as unknown as SerialNavigator;
    return !!nav.serial && window.isSecureContext;
  }

  public setCallbacks(
    onLine: (line: string) => void,
    onDisconnect: (error?: Error) => void
  ) {
    this.onLineReceivedCallback = onLine;
    this.onDisconnectCallback = onDisconnect;
  }

  public getPortInfo(): { usbVendorId?: number; usbProductId?: number; label?: string } | null {
    if (!this.port) return null;
    try {
      const info = this.port.getInfo();
      let label = 'Arduino USB Serial';
      if (info.usbVendorId === 0x2341) {
        label = 'Arduino Uno (Official)';
      } else if (info.usbVendorId === 0x1a86) {
        label = 'Arduino Uno (CH340 USB)';
      } else if (info.usbVendorId === 0x0403) {
        label = 'Arduino Uno (FTDI)';
      }
      return {
        usbVendorId: info.usbVendorId,
        usbProductId: info.usbProductId,
        label,
      };
    } catch {
      return { label: 'Arduino Uno Port' };
    }
  }

  public async getAuthorizedPorts(): Promise<SerialPort[]> {
    if (!ArduinoSerialManager.isSupported()) return [];
    const nav = navigator as unknown as SerialNavigator;
    if (!nav.serial) return [];
    try {
      return await nav.serial.getPorts();
    } catch {
      return [];
    }
  }

  public async connect(baudRate = 9600, specificPort?: SerialPort): Promise<boolean> {
    if (!ArduinoSerialManager.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge on Windows 11.');
    }

    const nav = navigator as unknown as SerialNavigator;
    if (!nav.serial) {
      throw new Error('Web Serial API unavailable');
    }

    try {
      // If a specific previously authorized port was chosen, use it; otherwise prompt user
      this.port = specificPort || (await nav.serial.requestPort());

      try {
        await this.port.open({ baudRate });
      } catch (openErr: any) {
        // Specific Windows 11 troubleshooting for COM port lock
        const errMsg = openErr?.message || '';
        if (
          openErr?.name === 'NetworkError' ||
          errMsg.includes('Failed to open') ||
          errMsg.includes('Access denied') ||
          errMsg.includes('device is already open')
        ) {
          throw new Error(
            'Windows COM Port Conflict: The port is currently locked. Please CLOSE the Arduino IDE Serial Monitor, Serial Plotter, or any other app using this COM port, then try connecting again.'
          );
        }
        throw openErr;
      }

      this.keepReading = true;
      this.startReadingLoop();

      return true;
    } catch (err: unknown) {
      this.cleanup();
      throw err;
    }
  }

  private async startReadingLoop() {
    if (!this.port || !this.port.readable) return;

    let buffer = '';
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          // Keep incomplete tail in buffer for next chunk
          buffer = lines.pop() || '';

          for (const line of lines) {
            const clean = line.trim();
            if (clean && this.onLineReceivedCallback) {
              this.onLineReceivedCallback(clean);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Serial read error:', error);
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback(error as Error);
      }
    } finally {
      try {
        if (this.reader) {
          await this.reader.cancel();
          this.reader.releaseLock();
        }
        await readableStreamClosed.catch(() => {});
      } catch {
        // ignore stream close errors
      }
      this.cleanup();
    }
  }

  public async disconnect(): Promise<void> {
    this.keepReading = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (err) {
      console.warn('Error closing serial port:', err);
    } finally {
      this.cleanup();
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    }
  }

  public isConnected(): boolean {
    return !!this.port && this.keepReading;
  }

  private cleanup() {
    this.port = null;
    this.reader = null;
    this.keepReading = false;
  }
}

export const serialManager = new ArduinoSerialManager();
