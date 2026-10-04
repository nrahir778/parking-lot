import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Wifi,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Smartphone,
  Play,
  Activity,
  Cpu,
  Usb,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { hc05Bluetooth, DiscoveredBluetoothDevice } from '../services/webBluetooth';
import { ConnectionMode } from '../types';
import { downloadArduinoInoFile } from '../utils/downloadFirmware';

interface BluetoothConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionMode: ConnectionMode;
  portLabel?: string;
  onConnectBluetooth: (deviceId?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onConnectUSB: () => Promise<void>;
  isLightMode?: boolean;
}

export const BluetoothConnectModal: React.FC<BluetoothConnectModalProps> = ({
  isOpen,
  onClose,
  connectionMode,
  portLabel,
  onConnectBluetooth,
  onDisconnect,
  onConnectUSB,
  isLightMode = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredBluetoothDevice[]>([]);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrorStatus(null);
      setDiscoveredDevices([]);
      setIsScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = connectionMode === 'connected_bt';
  const isConnecting = connectionMode === 'connecting' || !!connectingDeviceId;

  const handleStartScan = async () => {
    setErrorStatus(null);
    setIsScanning(true);
    setDiscoveredDevices([]);

    try {
      await hc05Bluetooth.scanForDevices(
        (dev) => {
          setDiscoveredDevices((prev) => {
            if (prev.some((d) => d.id === dev.id)) return prev;
            return [...prev, dev];
          });
        },
        8000
      );
    } catch (err: any) {
      console.warn('Scan exception:', err);
      // Fallback: trigger direct connect request
      try {
        await onConnectBluetooth();
        onClose();
      } catch (connectErr: any) {
        setErrorStatus(connectErr?.message || 'Bluetooth connection was cancelled or unavailable.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceSelect = async (deviceId: string) => {
    setErrorStatus(null);
    setConnectingDeviceId(deviceId);
    try {
      await onConnectBluetooth(deviceId);
      onClose();
    } catch (err: any) {
      setErrorStatus(err?.message || 'Failed to connect to selected Bluetooth device.');
    } finally {
      setConnectingDeviceId(null);
    }
  };

  const handleDirectConnect = async () => {
    setErrorStatus(null);
    try {
      await onConnectBluetooth();
      onClose();
    } catch (err: any) {
      setErrorStatus(
        err?.message ||
          'Bluetooth connection request failed. Ensure Bluetooth is ON on your device and the HC-05 is powered.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in-95 duration-200 ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500">
              <Bluetooth className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Bluetooth Connection</h3>
              <p className="text-xs text-slate-400 font-mono">
                HC-05 · HM-10 · SPP / BLE UART @ 9600 Baud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active Connection Banner */}
          {isConnected ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      BLUETOOTH CONNECTED
                    </div>
                    <div className="text-sm font-semibold">{portLabel || 'HC-05 Serial Module'}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Receiving live Arduino telemetry
                    </div>
                  </div>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>

              {/* Download Firmware Card */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isLightMode
                    ? 'bg-cyan-50/80 border-cyan-200'
                    : 'bg-cyan-950/20 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-cyan-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-300">
                      Installed Arduino Firmware (.ino)
                    </div>
                    <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Download the C++ source code installed in this Arduino
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadArduinoInoFile()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ino</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Scan & Connect Primary CTA */}
              <div
                className={`p-4 rounded-xl border text-center space-y-3 ${
                  isLightMode
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-blue-950/20 border-blue-500/30'
                }`}
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                      <Bluetooth className={`w-7 h-7 ${isScanning ? 'animate-bounce' : ''}`} />
                    </div>
                    {isScanning && (
                      <span className="absolute -inset-1 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Connect to Arduino Wireless Module</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Search for your HC-05 / HM-10 module. If prompted on Android, use PIN{' '}
                    <strong className="text-blue-400">1234</strong> or{' '}
                    <strong className="text-blue-400">0000</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleDirectConnect}
                    disabled={isConnecting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Pairing...</span>
                      </>
                    ) : (
                      <>
                        <Bluetooth className="w-4 h-4" />
                        <span>Select &amp; Connect HC-05</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className={`px-3.5 py-2.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLightMode
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning...' : 'Scan Nearby'}</span>
                  </button>
                </div>
              </div>

              {/* Discovered Device List */}
              {discoveredDevices.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                    Nearby Devices Found:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {discoveredDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isLightMode
                            ? 'bg-slate-50 border-slate-200 hover:border-blue-400'
                            : 'bg-slate-800/60 border-slate-700 hover:border-blue-500/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">{dev.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                              {dev.id}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeviceSelect(dev.id)}
                          disabled={connectingDeviceId === dev.id}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          {connectingDeviceId === dev.id ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

          {/* Error Status Display */}
          {errorStatus && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                isLightMode
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="font-bold">Bluetooth Notice: </span>
                <span>{errorStatus}</span>
              </div>
            </div>
          )}
            </div>
          )}

        {/* Quick Hardware Checklist */}
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
          }`}
        >
          <div
            className={`font-semibold flex items-center gap-1.5 font-mono ${
              isLightMode ? 'text-cyan-700' : 'text-cyan-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>HC-05 Quick Wiring Checklist</span>
          </div>
          <ul
            className={`space-y-1 list-disc list-inside text-[11px] leading-relaxed ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <li>
              <strong>VCC:</strong> 5V from Arduino Uno &middot; <strong>GND:</strong> GND
            </li>
            <li>
              <strong>TXD of HC-05:</strong> Connect to <strong>Pin 10</strong> (RX) of Uno
            </li>
            <li>
              <strong>RXD of HC-05:</strong> Connect to <strong>Pin 11</strong> (TX) via 1k/2k
              divider
            </li>
            <li>
              <strong>Baud Rate:</strong> 9600 baud &middot; <strong>Pairing PIN:</strong> 1234 or
              0000
            </li>
          </ul>
        </div>

        {/* Alternatives */}
        <div
          className={`pt-2 border-t flex items-center justify-between gap-2 ${
            isLightMode ? 'border-slate-200' : 'border-slate-700/60'
          }`}
        >
          {/* USB Alternative */}
          <button
            onClick={() => {
              onClose();
              onConnectUSB();
            }}
            className={`text-xs font-mono hover:underline flex items-center gap-1 cursor-pointer ${
              isLightMode ? 'text-cyan-700' : 'text-cyan-400'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>Or connect via USB Cable (OTG)</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
