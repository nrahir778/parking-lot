import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CameraView, SlotData, GateState } from '../types';
import { Car3D } from './Car3D';
import {
  Compass,
  Eye,
  Maximize2,
  Sparkles,
  Navigation,
  ShieldCheck,
  ShieldAlert,
  Radio,
  IndianRupee,
  X,
  Car,
} from 'lucide-react';

interface IsometricParkingLotProps {
  slots: SlotData[];
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  onSlotClick?: (slotId: number) => void;
  selectedSlotId?: number;
  isLightMode?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: (fullscreen: boolean) => void;
  isConnected?: boolean;
}

export const IsometricParkingLot: React.FC<IsometricParkingLotProps> = ({
  slots,
  gateState,
  hardwareBuzzerOn,
  onSlotClick,
  selectedSlotId,
  isLightMode = false,
  isFullscreen = false,
  onToggleFullscreen,
  isConnected = false,
}) => {
  const [cameraView, setCameraView] = useState<CameraView>('isometric');
  const [showSensorRays, setShowSensorRays] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  // Monitor container width for responsive scaling
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isFullscreen]);

  const isGateClosed = gateState.angle >= 45 || gateState.status === 'CLOSED';
  const totalOccupied = isConnected ? slots.filter((s) => s.status === 'OCCUPIED').length : 0;
  const availableCount = Math.max(0, slots.length - totalOccupied);

  // Dynamic scale factor to guarantee the 3D scene fits inside viewport
  const sceneScale = useMemo(() => {
    if (isFullscreen) {
      const maxW = typeof window !== 'undefined' ? window.innerWidth : 700;
      const maxH = typeof window !== 'undefined' ? window.innerHeight : 600;
      return Math.min(1.2, Math.max(0.65, Math.min((maxW - 32) / 600, (maxH - 120) / 480)));
    }
    if (containerWidth < 360) return 0.54;
    if (containerWidth < 420) return 0.62;
    if (containerWidth < 500) return 0.72;
    if (containerWidth < 640) return 0.82;
    if (containerWidth < 768) return 0.92;
    return 1.0;
  }, [containerWidth, isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-300 flex flex-col items-center justify-between select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none shadow-none pt-[max(3.6rem,calc(env(safe-area-inset-top,28px)+2.8rem))] pb-3'
          : 'h-[400px] sm:h-[480px] lg:h-[540px] rounded-3xl border shadow-xl p-2 sm:p-4'
      } ${
        isLightMode
          ? 'bg-gradient-to-b from-slate-100 via-sky-50 to-slate-200 border-slate-300/80 shadow-slate-300/40'
          : 'bg-gradient-to-b from-[#0b0f19] via-[#080c14] to-[#04070d] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className={`absolute inset-0 pointer-events-none bg-[size:32px_32px] ${
          isLightMode
            ? 'bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,#38bdf805_1px,transparent_1px),linear-gradient(to_bottom,#38bdf805_1px,transparent_1px)]'
        }`}
      />

      {/* TOP MINIMALIST CONTROL BAR */}
      <div
        className={`${
          isFullscreen
            ? 'fixed top-0 inset-x-0 z-50 pt-[max(0.5rem,env(safe-area-inset-top,24px))] pb-2 px-3 sm:px-6 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-md'
            : 'w-full z-30'
        } flex items-center justify-between gap-2 pointer-events-auto`}
      >
        {/* Left: Minimalist Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium border shadow-xs backdrop-blur-md transition-all ${
              isLightMode && !isFullscreen
                ? 'bg-white/95 text-slate-800 border-slate-300'
                : 'glass-panel text-slate-200 border-slate-700/80'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-semibold tracking-tight text-xs sm:text-sm">
              Lakhapar Parking Area
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-900 text-cyan-300 border border-cyan-500/30 tabular-nums">
              {isConnected ? `${totalOccupied}/3 Occupied` : 'Standby'}
            </span>
          </div>

          <div className="hidden xs:flex px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-300 font-mono text-xs font-semibold items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            <span>₹10/min</span>
          </div>
        </div>

        {/* Right: Camera Switcher & Fullscreen Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-full border shadow-xs backdrop-blur-md ${
              isLightMode && !isFullscreen ? 'bg-white/95 border-slate-300' : 'glass-panel border-slate-700/80'
            }`}
          >
            <button
              onClick={() => setCameraView('isometric')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                cameraView === 'isometric'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3D View"
            >
              <Compass className="w-3 h-3" />
              <span>3D</span>
            </button>

            <button
              onClick={() => setCameraView('topdown')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                cameraView === 'topdown'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Top View"
            >
              <Eye className="w-3 h-3" />
              <span>Top</span>
            </button>

            <button
              onClick={() => setShowSensorRays(!showSensorRays)}
              className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                showSensorRays ? 'text-cyan-400 bg-cyan-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Sensor Beams"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onToggleFullscreen && onToggleFullscreen(!isFullscreen)}
            className={`p-2 rounded-full border transition-all active:scale-95 cursor-pointer ${
              isFullscreen
                ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border-cyan-500/40'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D PARKING YARD SCENE CONTAINER */}
      <div className="w-full flex-1 flex items-center justify-center overflow-visible perspective-1600 select-none py-1">
        <div
          className={`parking-scene preserve-3d transition-transform duration-700 ease-out origin-center`}
          style={{
            transform: `${
              cameraView === 'isometric'
                ? `rotateX(48deg) rotateZ(-22deg) scale(${sceneScale})`
                : cameraView === 'topdown'
                ? `rotateX(0deg) rotateZ(0deg) scale(${sceneScale * 0.95})`
                : `rotateX(62deg) rotateZ(-12deg) scale(${sceneScale * 1.05})`
            }`,
          }}
        >
          {/* ARCHITECTURAL PLATFORM FOUNDATION */}
          <div
            className="relative w-[560px] rounded-3xl border-2 preserve-3d flex flex-col items-center shadow-2xl overflow-hidden transition-all duration-500"
            style={{
              background: isLightMode
                ? 'linear-gradient(180deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(180deg, #161e2e 0%, #0d131f 100%)',
              borderColor: isLightMode ? '#94a3b8' : '#334155',
              boxShadow: isLightMode
                ? '0 30px 60px -15px rgba(51, 65, 85, 0.5), inset 0 2px 4px rgba(255,255,255,0.4)'
                : '0 35px 70px -15px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255,255,255,0.08)',
              transform: 'translateZ(0px)',
            }}
          >
            {/* 1. TOP MARQUEE: ONLY "Lakhapar Parking Area" */}
            <div
              className={`w-full py-2.5 px-6 border-b flex items-center justify-between ${
                isLightMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-black/80 border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                <h2 className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-sans">
                  Lakhapar Parking Area
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>3-Bay Smart Facility</span>
              </div>
            </div>

            {/* 2. THE 3 PARKING BAYS WITH LANDSCAPED GRASS MEDIANS */}
            <div className="w-full px-5 py-4 flex items-center justify-between gap-3 preserve-3d">
              {slots.map((slot, index) => {
                const isOccupied = isConnected && slot.status === 'OCCUPIED';
                const isEmpty = isConnected && (slot.status === 'EMPTY' || slot.status === 'AVAILABLE');
                const isSelected = selectedSlotId === slot.id;

                return (
                  <React.Fragment key={slot.id}>
                    {/* Landscaped Green Grass Median Between Bays */}
                    {index > 0 && (
                      <div
                        className="flex-none w-4 h-64 rounded-xl border border-slate-500/40 bg-slate-800/80 p-0.5 shadow-sm flex flex-col items-center justify-between py-2 preserve-3d"
                        style={{ transform: 'translateZ(3px)' }}
                        title="Grass median divider"
                      >
                        <div className="w-full h-full rounded-lg grass-divider-texture flex flex-col items-center justify-between py-2 shadow-inner">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300 shadow-xs" />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-400 shadow-xs" />
                        </div>
                      </div>
                    )}

                    {/* PARKING BAY STALL */}
                    <div
                      onClick={() => onSlotClick && onSlotClick(slot.id)}
                      className={`relative flex-1 h-64 rounded-2xl border-2 p-2 flex flex-col items-center justify-between transition-all duration-300 cursor-pointer preserve-3d ${
                        isOccupied
                          ? 'border-rose-500/90 bg-rose-950/30 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                          : isEmpty
                          ? 'border-emerald-500/90 bg-emerald-950/25 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          : isLightMode
                          ? 'border-slate-400/80 bg-slate-800/30'
                          : 'border-slate-700 bg-slate-900/40'
                      } ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-[1.01]'
                          : ''
                      }`}
                    >
                      {/* Top Bay Header: Slot ID & Status Light */}
                      <div className="w-full flex items-center justify-between z-20">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-white bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                            LOT {slot.id}
                          </span>
                        </div>

                        {/* Minimalist Smart Sensor Status Indicator */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                              isOccupied
                                ? 'bg-rose-500 border-rose-200 shadow-[0_0_12px_#f43f5e]'
                                : isEmpty
                                ? 'bg-emerald-500 border-emerald-200 shadow-[0_0_12px_#10b981]'
                                : 'bg-slate-500 border-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Optical Sonar Ray Beaming Down */}
                      {showSensorRays && (
                        <div
                          className={`w-0.5 h-12 pointer-events-none transition-all duration-500 absolute top-7 left-1/2 -translate-x-1/2 ${
                            isOccupied
                              ? 'bg-gradient-to-b from-rose-500 to-transparent'
                              : isEmpty
                              ? 'bg-gradient-to-b from-emerald-500 to-transparent'
                              : 'bg-gradient-to-b from-slate-400 to-transparent'
                          }`}
                        />
                      )}

                      {/* Central Vehicle Area: Realistic Car or Clean Empty Graphic */}
                      <div className="relative w-full flex-1 flex items-center justify-center my-1 preserve-3d">
                        {isOccupied ? (
                          <Car3D
                            car={slot.car}
                            slotNumber={slot.id}
                            currentCharge={slot.currentCharge}
                            parkedSince={slot.parkedSince}
                            isLightMode={isLightMode}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                            <div
                              className={`w-14 h-14 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center ${
                                isEmpty
                                  ? 'border-emerald-400/80 bg-emerald-500/10'
                                  : 'border-slate-500/60 bg-slate-500/10'
                              }`}
                            >
                              <span
                                className={`text-2xl font-mono font-black ${
                                  isEmpty ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                0{slot.id}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-mono tracking-widest font-bold uppercase ${
                                isEmpty ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {isEmpty ? 'AVAILABLE' : 'STANDBY'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Minimalist Rubber Wheel Stop Curb */}
                      <div
                        className="w-20 h-2 rounded-xs bg-neutral-950 border border-slate-600 shadow-md mb-1 z-20 rumble-strip"
                        style={{ transform: 'translateZ(3px)' }}
                      />

                      {/* Bottom Live Telemetry & Charge Badge */}
                      <div className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono text-slate-200 bg-black/85 rounded-lg border border-white/10 z-20">
                        <span className="tabular-nums flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-cyan-400" />
                          {slot.hasHardwareReading && isConnected
                            ? `${slot.distance.toFixed(1)} ${slot.unit || 'cm'}`
                            : '--.- cm'}
                        </span>
                        {isOccupied ? (
                          <span className="tabular-nums font-black text-emerald-400 animate-pulse">
                            ₹{(slot.currentCharge || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-400">FREE</span>
                        )}
                      </div>

                      {/* White Stop Bar Strip At Bay Exit */}
                      <div className="absolute -bottom-1 inset-x-2 h-1 bg-white rounded-full shadow-[0_0_6px_#ffffff] z-30" />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* 3. CIRCULATION DRIVEWAY WITH WHITE ROAD STRIPES */}
            <div
              className={`w-full py-2.5 px-6 border-t-2 border-b-2 flex items-center justify-between relative overflow-hidden ${
                isLightMode ? 'bg-slate-700 border-white/60' : 'bg-[#101724] border-white/40'
              }`}
            >
              {/* Center dashed white road stripes */}
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-1 white-road-stripes opacity-90 shadow-[0_0_4px_#ffffff] pointer-events-none" />

              {/* Bay Directional Guide Arrows */}
              <div className="flex items-center gap-6 z-10">
                <div className="flex items-center gap-1 text-white font-mono text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span className="text-yellow-400 text-xs">⬆</span>
                  <span>BAY 1</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span className="text-yellow-400 text-xs">⬆</span>
                  <span>BAY 2</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span className="text-yellow-400 text-xs">⬆</span>
                  <span>BAY 3</span>
                </div>
              </div>

              {/* Drive Aisle Indicator */}
              <div className="flex items-center gap-2 z-10">
                <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-white flex items-center justify-center shadow-xs">
                  <span className="text-black font-black text-[9px] font-sans">10</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span>ONE-WAY</span>
                  <span className="text-yellow-400 text-xs">➔</span>
                </div>
              </div>
            </div>

            {/* 4. ENTRANCE GATE & MG995 BOOM BARRIER */}
            <div
              className={`w-full py-2.5 px-6 flex items-center justify-between relative overflow-hidden ${
                isLightMode ? 'bg-slate-800' : 'bg-black/90'
              }`}
            >
              {/* White lane divider */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 white-road-stripes opacity-60 pointer-events-none" />

              {/* Barrier Gate & Servo Mechanism */}
              <div className="flex items-center gap-3 z-10">
                {/* Security Gate Tower */}
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-600 shadow-md flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>

                {/* Servo Actuator */}
                <div className="relative w-6 h-8 rounded-md bg-amber-500 border border-neutral-900 shadow-md flex flex-col items-center justify-between py-1">
                  <span className="text-[6px] font-mono font-black text-black">MG995</span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full border border-white ${
                      isGateClosed
                        ? 'bg-red-600 shadow-[0_0_6px_#ef4444]'
                        : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                    }`}
                  />
                </div>

                {/* Boom Barrier Arm */}
                <div className="relative w-28 h-2 bg-white rounded-r border border-slate-700 shadow-md overflow-hidden curb-hazard transition-all duration-500">
                  <div
                    className={`absolute inset-0 bg-red-600/40 transition-opacity duration-300 ${
                      isGateClosed ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                    isGateClosed
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  GATE: {isGateClosed ? 'CLOSED' : 'OPEN'}
                </span>
              </div>

              {/* Pedestrian Zebra Crosswalk Strips */}
              <div
                className="w-16 h-6 white-crosswalk-stripes opacity-90 rounded-xs border-x border-white/40 z-10 shadow-xs hidden sm:block"
                title="Pedestrian Crosswalk"
              />

              {/* Clean Entrance Status */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 z-10">
                <span className="text-emerald-400 font-bold">ENTRY / EXIT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
