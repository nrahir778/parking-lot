import React, { useState } from 'react';
import { X, Copy, Check, Cpu, AlertTriangle, ShieldCheck, Bluetooth } from 'lucide-react';

interface ArduinoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const ARDUINO_CODE = `/*
  3-Slot Smart Parking System for Arduino Uno
  Hardware:
    - 3x HC-SR04 Ultrasonic Sensors:
        Slot 1: TRIG -> Pin 2, ECHO -> Pin 3
        Slot 2: TRIG -> Pin 4, ECHO -> Pin 5
        Slot 3: TRIG -> Pin 6, ECHO -> Pin 7
    - 3x FSR Sensors:
        Slot 1: A0 (with 10k pulldown to GND)
        Slot 2: A1 (with 10k pulldown to GND)
        Slot 3: A2 (with 10k pulldown to GND)
    - Buzzer: Pin 8
    - MG995 Servo: Pin 11 (Gate Barrier)
    - HC-05 Bluetooth Module:
        HC-05 TXD -> Arduino RX (Pin 0)
        HC-05 RXD -> Arduino TX (Pin 1 via 1k/2k voltage divider)
        HC-05 VCC -> 5V, GND -> GND

  Logic:
    - Slot is OCCUPIED when: Distance <= 3.0 cm AND FSR >= 15
    - When all 3 slots occupied:
        - Servo moves to 90 degrees (Gate CLOSED)
        - Buzzer turns ON (Pin 8 HIGH)
    - Otherwise:
        - Servo moves to 0 degrees (Gate OPEN)
        - Buzzer turns OFF (Pin 8 LOW)
    - Telemetry sent over Serial @ 9600 baud (both USB and HC-05 receive this stream!)
*/

#include <Servo.h>

// HC-SR04 Ultrasonic Pins
const int TRIG_1 = 2;
const int ECHO_1 = 3;
const int TRIG_2 = 4;
const int ECHO_2 = 5;
const int TRIG_3 = 6;
const int ECHO_3 = 7;

// FSR Analog Pins
const int FSR_1 = A0;
const int FSR_2 = A1;
const int FSR_3 = A2;

// Output Actuators
const int BUZZER_PIN = 8;
const int SERVO_PIN = 11;

Servo gateServo;

// Thresholds according to hardware spec
const float DIST_THRESHOLD_CM = 3.0;
const int FSR_THRESHOLD = 15;

float readDistanceCM(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 99.9;
  return (duration * 0.0343) / 2.0;
}

void setup() {
  // 9600 Baud: Default rate for HC-05 Bluetooth and USB Serial
  Serial.begin(9600);

  pinMode(TRIG_1, OUTPUT);
  pinMode(ECHO_1, INPUT);
  pinMode(TRIG_2, OUTPUT);
  pinMode(ECHO_2, INPUT);
  pinMode(TRIG_3, OUTPUT);
  pinMode(ECHO_3, INPUT);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  gateServo.attach(SERVO_PIN);
  gateServo.write(0); // 0 degrees = Gate OPEN initially
}

void loop() {
  // 1. Read HC-SR04 Distances
  float d1 = readDistanceCM(TRIG_1, ECHO_1);
  float d2 = readDistanceCM(TRIG_2, ECHO_2);
  float d3 = readDistanceCM(TRIG_3, ECHO_3);

  // 2. Read FSR Analog Sensors
  int fsr1 = analogRead(FSR_1);
  int fsr2 = analogRead(FSR_2);
  int fsr3 = analogRead(FSR_3);

  // 3. Determine Slot Occupancy: distance <= 3.0 cm AND FSR >= 15
  bool occ1 = (d1 <= DIST_THRESHOLD_CM && fsr1 >= FSR_THRESHOLD);
  bool occ2 = (d2 <= DIST_THRESHOLD_CM && fsr2 >= FSR_THRESHOLD);
  bool occ3 = (d3 <= DIST_THRESHOLD_CM && fsr3 >= FSR_THRESHOLD);

  bool allOccupied = (occ1 && occ2 && occ3);

  // 4. Actuator Control: MG995 Gate & Buzzer
  if (allOccupied) {
    gateServo.write(90);            // 90 deg = Gate CLOSED
    digitalWrite(BUZZER_PIN, HIGH); // Buzzer ON
  } else {
    gateServo.write(0);             // 0 deg = Gate OPEN
    digitalWrite(BUZZER_PIN, LOW);  // Buzzer OFF
  }

  // 5. Send Telemetry to Web Dashboard via Serial (9600 Baud)
  Serial.print("SLOT 1 | Distance: "); Serial.print(d1, 1);
  Serial.print(" cm | FSR: "); Serial.print(fsr1);
  Serial.print(" | STATUS: "); Serial.println(occ1 ? "OCCUPIED" : "AVAILABLE");

  Serial.print("SLOT 2 | Distance: "); Serial.print(d2, 1);
  Serial.print(" cm | FSR: "); Serial.print(fsr2);
  Serial.print(" | STATUS: "); Serial.println(occ2 ? "OCCUPIED" : "AVAILABLE");

  Serial.print("SLOT 3 | Distance: "); Serial.print(d3, 1);
  Serial.print(" cm | FSR: "); Serial.print(fsr3);
  Serial.print(" | STATUS: "); Serial.println(occ3 ? "OCCUPIED" : "AVAILABLE");

  Serial.print("GATE: "); Serial.print(allOccupied ? 90 : 0);
  Serial.print(" deg | BUZZER: "); Serial.println(allOccupied ? "ON" : "OFF");

  delay(400); // 400ms update cadence
}
`;

export const ArduinoGuideModal: React.FC<ArduinoGuideModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-3xl rounded-2xl p-6 border max-h-[90vh] flex flex-col my-8 transition-colors ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-900 shadow-2xl'
            : 'glass-panel-elevated border-slate-700/80 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isLightMode ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Arduino Uno & HC-05 Bluetooth Setup Guide
              </h3>
              <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Pin mapping, HC-05 wireless pairing, and complete C++ sketch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLightMode ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* HC-05 Bluetooth Pairing Guide */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1.5 text-blue-700 dark:text-blue-200">
            <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
              <Bluetooth className="w-4 h-4 shrink-0 text-blue-500" />
              <span>How to Connect via HC-05 Bluetooth:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed pl-1">
              <li>
                Connect HC-05 module to Arduino Uno: <strong>VCC → 5V, GND → GND, TXD → RX (Pin 0), RXD → TX (Pin 1)</strong>.
              </li>
              <li>
                In Windows 11: Go to <strong>Settings &gt; Bluetooth &amp; devices &gt; Add device &gt; Bluetooth</strong>.
              </li>
              <li>
                Select <strong>HC-05</strong> and enter PIN <strong>1234</strong> (or 0000).
              </li>
              <li>
                Once paired, in this app click <strong>Connect HC-05</strong> (or <strong>Connect USB</strong> and pick the paired HC-05 COM port).
              </li>
            </ol>
          </div>

          {/* Windows 11 Exclusive COM Port Tip */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Windows 11 Tip (Close Arduino Serial Monitor):</span>
            </div>
            <p className="leading-relaxed">
              When connecting via USB, make sure the Arduino IDE <em>Serial Monitor</em> is CLOSED before clicking Connect. Windows does not allow two apps to use the same COM port simultaneously.
            </p>
          </div>

          {/* Pin Configuration Table */}
          <div>
            <h4
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                isLightMode ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Hardware Pin Mapping
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div
                className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-cyan-600 dark:text-cyan-400 font-bold block mb-1">
                  HC-SR04 Ultrasonic Sensors:
                </span>
                <div>Slot 1: TRIG D2, ECHO D3</div>
                <div>Slot 2: TRIG D4, ECHO D5</div>
                <div>Slot 3: TRIG D6, ECHO D7</div>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">
                  FSR Force Sensors:
                </span>
                <div>Slot 1 FSR: Pin A0 (with 10k pulldown)</div>
                <div>Slot 2 FSR: Pin A1 (with 10k pulldown)</div>
                <div>Slot 3 FSR: Pin A2 (with 10k pulldown)</div>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-rose-600 dark:text-rose-400 font-bold block mb-1">
                  MG995 Gate Servo (D11):
                </span>
                <div>Signal: Pin D11, VCC: 5V, GND: GND</div>
                <div className="text-[11px] text-slate-500">0° = Gate OPEN | 90° = Gate CLOSED</div>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">
                  HC-05 Bluetooth Module:
                </span>
                <div>TXD → Pin 0 (RX), RXD → Pin 1 (TX)</div>
                <div className="text-[11px] text-slate-500">Buzzer (+): Pin D8 (Active HIGH)</div>
              </div>
            </div>
          </div>

          {/* Logic Summary */}
          <div
            className={`p-3 rounded-xl border text-xs ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Occupancy Logic:
            </span>
            <div className="font-mono">
              Slot is OCCUPIED if: (Distance ≤ 3.0 cm) AND (FSR reading ≥ 15)
            </div>
            <div className="font-mono mt-1 text-slate-500">
              Lot Full (All 3 Occupied): Servo moves to 90°, Buzzer turns ON.
            </div>
          </div>

          {/* Arduino Code Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isLightMode ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Arduino Uno Code (.ino)
              </span>
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/90 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {ARDUINO_CODE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`pt-3 border-t flex justify-end ${
            isLightMode ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isLightMode
                ? 'bg-slate-800 hover:bg-slate-900 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
