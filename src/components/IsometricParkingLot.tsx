import React, { useState } from 'react';
import { CameraView, SlotData, GateState } from '../types';
import { Car3D } from './Car3D';
import { Compass, Eye, Maximize2, Minimize2, RotateCcw, Sparkles, Bell } from 'lucide-react';

interface IsometricParkingLotProps {
  slots: SlotData[];
  gateState?: GateState;
  hardwareBuzzerOn?: boolean;
  onSlotClick?: (slotId: 1 | 2 | 3) => void;
  selectedSlotId?: number;
  isLightMode?: boolean;
}

export const IsometricParkingLot: React.FC<IsometricParkingLotProps> = ({
  slots,
  gateState = { angle: 0, status: 'OPEN' },
  hardwareBuzzerOn = false,
  onSlotClick,
  selectedSlotId,
  isLightMode = false,
}) => {
  const [cameraView, setCameraView] = useState<CameraView>('isometric');
  const [zoom, setZoom] = useState(1);
  const [showSensorRays, setShowSensorRays] = useState(true);

  const getCameraClass = () => {
    switch (cameraView) {
      case 'topdown':
        return 'topdown-view';
      case 'driver':
        return 'driver-view';
      case 'isometric':
      default:
        return 'isometric-view';
    }
  };

  const isGateClosed = gateState.angle >= 45 || gateState.status === 'CLOSED';

  return (
    <div
      className={`relative w-full h-[520px] md:h-[580px] rounded-2xl overflow-hidden border shadow-xl flex flex-col items-center justify-center p-4 transition-colors duration-500 ${
        isLightMode
          ? 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-slate-300/80 shadow-slate-300/50'
          : 'bg-gradient-to-b from-[#0b101d] via-[#090d18] to-[#060810] border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
      }`}
    >
      {/* Background Grid Pattern */}
      <div
        className={`absolute inset-0 bg-[size:32px_32px] pointer-events-none ${
          isLightMode
            ? 'bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)]'
        }`}
      />

      {/* Floating Control Bar for Camera & Display Modes */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium border shadow-xs ${
              isLightMode
                ? 'bg-white/90 text-slate-800 border-slate-300'
                : 'glass-panel text-slate-300 border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wide">3D PARKING YARD</span>
          </div>

          <button
            onClick={() => setShowSensorRays(!showSensorRays)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border shadow-xs ${
              showSensorRays
                ? isLightMode
                  ? 'bg-cyan-600 text-white border-cyan-700'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : isLightMode
                ? 'bg-white/80 text-slate-600 hover:text-slate-900 border-slate-300'
                : 'glass-panel text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title="Toggle Sensor Ultrasonic Distance Beams"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sensor Beams</span>
          </button>

          {/* Hardware Buzzer Alert Tag if active */}
          {hardwareBuzzerOn && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center gap-1.5 text-xs font-mono font-bold animate-pulse shadow-sm">
              <Bell className="w-3.5 h-3.5" />
              <span>BUZZER D8: ON</span>
            </div>
          )}
        </div>

        {/* Camera Perspective Switcher */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border shadow-xs ${
            isLightMode ? 'bg-white/90 border-slate-300' : 'glass-panel border-slate-700'
          }`}
        >
          <button
            onClick={() => setCameraView('isometric')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              cameraView === 'isometric'
                ? isLightMode
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-700/80 text-white shadow-sm'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Isometric</span>
          </button>

          <button
            onClick={() => setCameraView('topdown')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              cameraView === 'topdown'
                ? isLightMode
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-700/80 text-white shadow-sm'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Top-Down</span>
          </button>

          <button
            onClick={() => setCameraView('driver')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              cameraView === 'driver'
                ? isLightMode
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-700/80 text-white shadow-sm'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Driver View</span>
          </button>

          <div
            className={`w-px h-4 mx-1 ${isLightMode ? 'bg-slate-300' : 'bg-slate-700/80'}`}
          />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
            className={`p-1.5 rounded-md transition-colors ${
              isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Zoom In"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}
            className={`p-1.5 rounded-md transition-colors ${
              isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Zoom Out"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setCameraView('isometric');
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Scene Viewport */}
      <div
        className="w-full h-full flex items-center justify-center perspective-1600 overflow-visible"
        style={{ perspectiveOrigin: '50% 45%' }}
      >
        <div
          className={`parking-scene preserve-3d ${getCameraClass()} relative transition-transform duration-700 ease-out`}
          style={{
            transform: `${
              cameraView === 'isometric'
                ? `rotateX(56deg) rotateZ(-30deg) scale(${zoom})`
                : cameraView === 'topdown'
                ? `rotateX(0deg) rotateZ(0deg) scale(${zoom * 0.95})`
                : `rotateX(70deg) rotateZ(-12deg) scale(${zoom * 1.05})`
            }`,
          }}
        >
          {/* Main Parking Yard Ground Platform (Paved Asphalt / Concrete Slab) */}
          <div
            className="relative w-[550px] h-[350px] rounded-3xl preserve-3d transition-all duration-500"
            style={{
              background: isLightMode
                ? 'radial-gradient(ellipse at 50% 50%, #334155 0%, #1e293b 100%)'
                : 'radial-gradient(ellipse at 50% 50%, #171f2f 0%, #0d121c 100%)',
              boxShadow: isLightMode
                ? '0 30px 60px -10px rgba(71, 85, 105, 0.4), inset 0 2px 4px rgba(255,255,255,0.2), 0 0 0 3px #94a3b8'
                : '0 30px 60px -12px rgba(0, 0, 0, 0.9), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 2px rgba(255,255,255,0.08)',
              transform: 'translateZ(0px)',
            }}
          >
            {/* 3D Foundation Edge */}
            <div
              className={`absolute -bottom-3 inset-x-0 h-3 rounded-b-3xl border-x-2 border-b-2 ${
                isLightMode
                  ? 'bg-slate-600 border-slate-700'
                  : 'bg-neutral-900 border-slate-800'
              }`}
              style={{ transform: 'rotateX(-90deg) translateZ(0px)', transformOrigin: 'top' }}
            />

            {/* Driveway Lane / Entrance Roadway with MG995 Gate Servo Barrier */}
            <div className="absolute bottom-0 inset-x-0 h-24 border-t-2 border-dashed border-slate-400/50 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-between px-6 pointer-events-none preserve-3d">
              {/* ENTRY LANE WITH MG995 GATE BARRIER */}
              <div className="relative flex items-center gap-3 preserve-3d">
                {/* MG995 Servo Post */}
                <div
                  className="relative w-8 h-10 rounded-md bg-neutral-900 border border-slate-500 shadow-xl flex flex-col items-center justify-between py-1 preserve-3d"
                  style={{ transform: 'translateZ(14px)' }}
                >
                  <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-[6px] font-mono font-bold text-amber-400">MG995</span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isGateClosed
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                        : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    }`}
                  />
                </div>

                {/* Animated Gate Boom Arm */}
                <div
                  className="relative h-2.5 rounded-r-md transition-all duration-700 preserve-3d shadow-lg origin-left flex items-center"
                  style={{
                    width: '90px',
                    transform: `translateZ(16px) ${
                      isGateClosed ? 'rotateZ(0deg)' : 'rotateZ(-72deg)'
                    }`,
                    background:
                      'repeating-linear-gradient(45deg, #ef4444, #ef4444 8px, #ffffff 8px, #ffffff 16px)',
                    boxShadow: isGateClosed
                      ? '0 0 12px rgba(239,68,68,0.7)'
                      : '0 0 6px rgba(16,185,129,0.5)',
                  }}
                >
                  {/* Gate Arm Tip LED */}
                  <div
                    className={`absolute -right-1 w-2.5 h-2.5 rounded-full ${
                      isGateClosed
                        ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping'
                        : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                    }`}
                  />
                </div>

                {/* Gate Status Stencil */}
                <div className="flex flex-col ml-1 font-mono text-[9px]">
                  <span
                    className={`font-bold tracking-wider ${
                      isGateClosed ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    GATE: {gateState.angle}° ({gateState.status})
                  </span>
                  <span className="text-slate-300 text-[8px]">SERVO PIN D11</span>
                </div>
              </div>

              {/* Center Road Divider Chevrons */}
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-8 h-1 bg-amber-400 rounded-full" />
                <div className="w-8 h-1 bg-amber-400 rounded-full" />
              </div>

              {/* EXIT LANE */}
              <div className="flex items-center gap-1 opacity-50">
                <span className="text-xs font-mono tracking-widest text-slate-300 uppercase">
                  EXIT LANE
                </span>
                <span className="text-xl text-white font-mono">›››</span>
              </div>
            </div>

            {/* Rear Barrier Wall / Hardware Info Banner */}
            <div
              className={`absolute top-0 inset-x-0 h-14 rounded-t-3xl border-b flex items-center justify-between px-6 preserve-3d ${
                isLightMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-[#121927] border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest font-semibold">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 animate-pulse" />
                <span>3-SLOT SMART PARKING YARD</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono opacity-90">
                <span>HC-SR04: D2-D7</span>
                <span aria-hidden="true">·</span>
                <span>FSR: A0-A2</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-400 font-bold">HC-05 / USB 9600</span>
              </div>
            </div>

            {/* The 3 Parking Stalls Grid */}
            <div className="absolute top-14 inset-x-4 bottom-24 flex items-center justify-between px-3 gap-3 preserve-3d">
              {slots.map((slot) => {
                const isOccupied = slot.status === 'OCCUPIED';
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => onSlotClick && onSlotClick(slot.id)}
                    className={`relative flex-1 h-full rounded-2xl preserve-3d transition-all duration-500 cursor-pointer group flex flex-col items-center justify-between py-3 px-2 ${
                      isOccupied
                        ? 'border-2 border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.35)] bg-rose-950/20'
                        : 'border-2 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.3)] bg-emerald-950/20'
                    } ${
                      isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                    style={{
                      transform: 'translateZ(2px)',
                    }}
                  >
                    {/* Glowing Floor Neon Halo (Green or Red) */}
                    <div
                      className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-700 ${
                        isOccupied
                          ? 'bg-rose-500/10 shadow-[inset_0_0_20px_rgba(244,63,94,0.3)]'
                          : 'bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.25)]'
                      }`}
                    />

                    {/* Stenciled Slot Number and Boundary on Asphalt */}
                    <div className="w-full flex items-center justify-between px-2 pt-1 z-10">
                      <span className="text-xs font-mono font-bold tracking-wider text-white bg-black/60 px-2 py-0.5 rounded border border-white/20">
                        {slot.name}
                      </span>
                      {/* Live Quick Status */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors ${
                          isOccupied
                            ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                            : 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        }`}
                      >
                        {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                      </span>
                    </div>

                    {/* Ultrasonic Overhead Sensor Gantry (HC-SR04) */}
                    <div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 preserve-3d flex flex-col items-center pointer-events-none z-30"
                      style={{ transform: 'translateZ(45px)' }}
                    >
                      {/* Overhead Beacon Lamp */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-500 ${
                          isOccupied
                            ? 'bg-rose-500 border-rose-300 shadow-[0_0_18px_#f43f5e]'
                            : 'bg-emerald-500 border-emerald-300 shadow-[0_0_18px_#10b981]'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
                      </div>

                      {/* Transducer Support Stem */}
                      <div className="w-1 h-8 bg-slate-400 shadow-md" />

                      {/* Sensor Ray Projecting Down */}
                      {showSensorRays && (
                        <div
                          className={`w-0.5 h-16 pointer-events-none transition-all duration-500 ${
                            isOccupied
                              ? 'bg-gradient-to-b from-rose-500/80 to-transparent'
                              : 'bg-gradient-to-b from-emerald-500/80 to-transparent'
                          }`}
                          style={{
                            boxShadow: isOccupied
                              ? '0 0 10px rgba(244,63,94,0.8)'
                              : '0 0 10px rgba(16,185,129,0.8)',
                          }}
                        />
                      )}
                    </div>

                    {/* Wheel Stop Curb Block */}
                    <div
                      className="w-20 h-2.5 rounded-sm bg-neutral-800 border-t border-slate-400 shadow-md flex items-center justify-around px-1 z-10"
                      style={{ transform: 'translateZ(4px)' }}
                    >
                      <div className="w-3 h-1 bg-yellow-400 rounded-full opacity-90" />
                      <div className="w-3 h-1 bg-yellow-400 rounded-full opacity-90" />
                    </div>

                    {/* Central Area: Normal Simple Car or Empty Bay Marking */}
                    <div className="relative w-full flex-1 flex items-center justify-center preserve-3d my-1">
                      {isOccupied ? (
                        <Car3D car={slot.car} slotNumber={slot.id} isLightMode={isLightMode} />
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center gap-1 select-none pointer-events-none"
                          style={{ transform: 'translateZ(1px)' }}
                        >
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center bg-emerald-500/10">
                            <span className="text-2xl font-mono font-bold text-emerald-400">
                              {slot.id}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-semibold uppercase">
                            BAY EMPTY
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Bay Telemetry: HC-SR04 Distance & FSR Reading */}
                    <div className="w-full flex items-center justify-between px-2 pb-1 z-10 text-[10px] font-mono text-slate-200 bg-black/60 rounded-md py-0.5 border border-white/10">
                      <span className="tabular-nums font-semibold">
                        {slot.distance.toFixed(1)} cm
                      </span>
                      <span className="tabular-nums font-semibold text-cyan-300">
                        FSR: {slot.fsr ?? slot.pressure}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hint / Info Bar */}
      <div
        className={`absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] pointer-events-none ${
          isLightMode ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Hardware Rule: Occupied if (Dist ≤ 3.0cm) AND (FSR ≥ 15)
        </span>
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Occupied
          </span>
        </div>
      </div>
    </div>
  );
};
