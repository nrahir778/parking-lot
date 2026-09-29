export interface ParsedSlotData {
  slotId: 1 | 2 | 3;
  distance: number;
  pressure: number;
  status: 'OCCUPIED' | 'AVAILABLE';
  raw: string;
}

export interface ParsedBuzzerData {
  pulseCount: 1 | 2 | 3;
  raw: string;
}

export type SerialParseResult =
  | { type: 'slot'; data: ParsedSlotData }
  | { type: 'buzzer'; data: ParsedBuzzerData }
  | { type: 'unknown'; raw: string };

export class SerialLineParser {
  /**
   * Expected format:
   * SLOT 1 | Distance: 2.5 cm | Pressure: 500 | STATUS: OCCUPIED
   */
  public static parse(line: string): SerialParseResult {
    const trimmed = line.trim();
    if (!trimmed) return { type: 'unknown', raw: line };

    // Check for buzzer command in serial stream: e.g. "BUZZER: 2", "BUZZER 2", "BEEP: 3"
    const buzzerMatch = trimmed.match(/(?:BUZZER|BEEP)[:\s]+([1-3])/i);
    if (buzzerMatch) {
      const pulseCount = parseInt(buzzerMatch[1], 10) as 1 | 2 | 3;
      return {
        type: 'buzzer',
        data: { pulseCount, raw: trimmed }
      };
    }

    // Main Slot pattern:
    // SLOT 1 | Distance: 2.5 cm | Pressure: 500 | STATUS: OCCUPIED
    const mainRegex = /SLOT\s*([1-3])\s*\|\s*Distance:\s*([\d.]+)\s*cm\s*\|\s*Pressure:\s*(\d+)\s*\|\s*STATUS:\s*(OCCUPIED|AVAILABLE|VACANT)/i;
    const match = trimmed.match(mainRegex);

    if (match) {
      const slotNum = parseInt(match[1], 10);
      const slotId = (slotNum >= 1 && slotNum <= 3 ? slotNum : 1) as 1 | 2 | 3;
      const distance = parseFloat(match[2]);
      const pressure = parseInt(match[3], 10);
      const rawStatus = match[4].toUpperCase();
      const status: 'OCCUPIED' | 'AVAILABLE' = rawStatus === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE';

      return {
        type: 'slot',
        data: {
          slotId,
          distance,
          pressure,
          status,
          raw: trimmed
        }
      };
    }

    // Flexible fallback parser if spacing/units differ slightly
    if (/SLOT\s*[1-3]/i.test(trimmed)) {
      const slotMatch = trimmed.match(/SLOT\s*([1-3])/i);
      const distMatch = trimmed.match(/Distance:\s*([\d.]+)/i);
      const presMatch = trimmed.match(/Pressure:\s*(\d+)/i);
      const statMatch = trimmed.match(/STATUS:\s*(OCCUPIED|AVAILABLE|VACANT)/i);

      if (slotMatch) {
        const slotId = parseInt(slotMatch[1], 10) as 1 | 2 | 3;
        const distance = distMatch ? parseFloat(distMatch[1]) : 0;
        const pressure = presMatch ? parseInt(presMatch[1], 10) : 0;
        const status = statMatch && statMatch[1].toUpperCase() === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE';

        return {
          type: 'slot',
          data: {
            slotId,
            distance,
            pressure,
            status,
            raw: trimmed
          }
        };
      }
    }

    return { type: 'unknown', raw: trimmed };
  }
}

// Web Serial API types declaration for environments without DOM serial types
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<any> | null;
  writable: WritableStream<any> | null;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface SerialNavigator {
  serial?: {
    requestPort(options?: unknown): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
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

  public async connect(baudRate = 9600): Promise<boolean> {
    if (!ArduinoSerialManager.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }

    const nav = navigator as unknown as SerialNavigator;
    if (!nav.serial) {
      throw new Error('Web Serial API unavailable');
    }

    try {
      // Prompt user to select Arduino Uno serial port
      this.port = await nav.serial.requestPort();
      await this.port.open({ baudRate });

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
          // Keep incomplete tail in buffer
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
      } catch (e) {
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
