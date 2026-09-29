import React, { useState } from 'react';
import { X, Copy, Check, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ArduinoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ARDUINO_CODE = `/*
  3-Slot Smart Parking System for Arduino Uno
  Hardware:
    - 3x HC-SR04 Ultrasonic:
        Slot 1: TRIG -> Pin 2, ECHO -> Pin 3
        Slot 2: TRIG -> Pin 4, ECHO -> Pin 5
        Slot 3: TRIG -> Pin 6, ECHO -> Pin 7
    - 3x FSR Sensors:
        Slot 1: A0 (with 10k pulldown to GND)
        Slot 2: A1 (with 10k pulldown to GND)
        Slot 3: A2 (with 10k pulldown to GND)
    - Buzzer: Pin 8
    - MG995 Servo: Pin 11 (Gate Barrier)

  Logic:
    - Slot is OCCUPIED when: Distance <= 3.0 cm AND FSR >= 15
    - When all 3 slots occupied:
        - Servo moves to 90 degrees (Gate CLOSED / Lot Full)
        - Buzzer turns ON
    - Otherwise:
        - Servo moves to 0 degrees (Gate OPEN)
        - Buzzer turns OFF
    - Serial communication @ 9600 baud
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

// Actuators
const int BUZZER_PIN = 8;
const int SERVO_PIN = 11;

Servo gateServo;

// Thresholds
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
  // 1. Read Distance from HC-SR04 sensors
  float d1 = readDistanceCM(TRIG_1, ECHO_1);
  float d2 = readDistanceCM(TRIG_2, ECHO_2);
  float d3 = readDistanceCM(TRIG_3, ECHO_3);

  // 2. Read FSR Analog Sensors
  int fsr1 = analogRead(FSR_1);
  int fsr2 = analogRead(FSR_2);
  int fsr3 = analogRead(FSR_3);

  // 3. Determine Slot Occupancy: distance <= 3 cm AND FSR >= 15
  bool occ1 = (d1 <= DIST_THRESHOLD_CM && fsr1 >= FSR_THRESHOLD);
  bool occ2 = (d2 <= DIST_THRESHOLD_CM && fsr2 >= FSR_THRESHOLD);
  bool occ3 = (d3 <= DIST_THRESHOLD_CM && fsr3 >= FSR_THRESHOLD);

  bool allOccupied = (occ1 && occ2 && occ3);

  // 4. Actuator Control: MG995 Gate & Buzzer
  if (allOccupied) {
    gateServo.write(90);             // 90 deg = Gate CLOSED
    digitalWrite(BUZZER_PIN, HIGH);  // Buzzer ON
  } else {
    gateServo.write(0);              // 0 deg = Gate OPEN
    digitalWrite(BUZZER_PIN, LOW);   // Buzzer OFF
  }

  // 5. Send Telemetry Lines to Web Dashboard @ 9600 Baud
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

  delay(400); // 400ms update rate
}
`;

export const ArduinoGuideModal: React.FC<ArduinoGuideModalProps> = ({ isOpen, onClose }) => {
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
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-2xl p-6 border border-slate-700/80 max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Arduino Uno Firmware & Wiring Setup
              </h3>
              <p className="text-xs text-slate-400">
                Official pin mapping, serial protocol & Windows 11 connection notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Windows 11 Critical Tip Callout */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Windows 11 COM Port Lock (Important):</span>
            </div>
            <p className="leading-relaxed">
              Windows assigns exclusive access to serial COM ports. Before clicking{' '}
              <strong className="text-white">Connect Arduino</strong> in this dashboard, you{' '}
              <strong className="underline text-amber-300">MUST CLOSE</strong> the Arduino IDE{' '}
              <em>Serial Monitor</em> and <em>Serial Plotter</em>. If the Serial Monitor is left open, the browser will receive an "Access Denied" error.
            </p>
          </div>

          {/* Pin Configuration Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hardware Pin Mapping
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">HC-SR04 Ultrasonic Sensors:</span>
                <div>Slot 1: TRIG D2, ECHO D3</div>
                <div>Slot 2: TRIG D4, ECHO D5</div>
                <div>Slot 3: TRIG D6, ECHO D7</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">FSR Sensors (Analog):</span>
                <div>Slot 1 FSR: Pin A0 (10k pulldown)</div>
                <div>Slot 2 FSR: Pin A1 (10k pulldown)</div>
                <div>Slot 3 FSR: Pin A2 (10k pulldown)</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-rose-400 font-bold block mb-1">Gate Servo Actuator:</span>
                <div>MG995 Servo Signal: Pin D11</div>
                <div className="text-[11px] text-slate-400">0° = Gate OPEN | 90° = Gate CLOSED</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">Common Piezo Buzzer:</span>
                <div>Buzzer (+): Pin D8 (Active HIGH)</div>
                <div className="text-[11px] text-slate-400">ON when all 3 slots occupied, OFF otherwise</div>
              </div>
            </div>
          </div>

          {/* Logic Summary */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Occupancy Logic:
            </span>
            <div className="text-slate-300 font-mono">
              Slot is OCCUPIED if: (Distance ≤ 3.0 cm) AND (FSR reading ≥ 15)
            </div>
            <div className="text-slate-300 font-mono mt-1">
              Lot Full (All 3 Occupied): Servo moves to 90°, Buzzer turns ON.
            </div>
          </div>

          {/* Arduino Code Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Arduino Uno C++ Code (.ino)
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/80 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {ARDUINO_CODE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
