import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CameraView, SlotData, GateState } from '../types';
import { Car3D } from './Car3D';
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Bell,
  Navigation,
  ShieldCheck,
  Radio,
  Expand,
  X,
  IndianRupee,
} from 'lucide-react';

interface IsometricParkingLotProps {
  slots: SlotData[];
  gateState?: GateState;
  hardwareBuzzerOn?: boolean;
  onSlotClick?: (slotId: 1 | 2 | 3) => void;
  selectedSlotId?: number;
  isLightMode?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: (fullscreen: boolean) => void;
}

export const IsometricParkingLot: React.FC<IsometricParkingLotProps> = ({
  slots,
  gateState = { angle: 0, status: 'OPEN' },
  hardwareBuzzerOn = false,
  onSlotClick,
  selectedSlotId,
  isLightMode = false,
  isFullscreen: controlledFullscreen,
  onToggleFullscreen,
}) => {
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = controlledFullscreen !== undefined ? controlledFullscreen : internalFullscreen;

  const [cameraView, setCameraView] = useState<CameraView>('isometric');
  const [zoom, setZoom] = useState(1);
  const [showSensorRays, setShowSensorRays] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 768
  );

  // Resize listener to dynamically compute mobile & laptop scale factors
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
        setViewportHeight(containerRef.current.clientHeight);
      } else if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
        setViewportHeight(window.innerHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // Fullscreen toggle handler (with native Fullscreen API support + Esc key listener)
  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    if (onToggleFullscreen) {
      onToggleFullscreen(nextState);
    } else {
      setInternalFullscreen(nextState);
    }

    if (nextState) {
      if (containerRef.current && document.fullscreenEnabled && !document.fullscreenElement) {
        containerRef.current.requestFullscreen?.().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  // Keyboard shortcut listener: F = toggle fullscreen, Escape = exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (onToggleFullscreen) {
          onToggleFullscreen(false);
        } else {
          setInternalFullscreen(false);
        }
      } else if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  // Sync with native fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = !!document.fullscreenElement;
      if (!isNativeFull && isFullscreen) {
        if (onToggleFullscreen) {
          onToggleFullscreen(false);
        } else {
          setInternalFullscreen(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, onToggleFullscreen]);

  // Compute responsive auto-scale so the entire yard and road network fits 100% on any mobile screen and laptop
  const autoScale = useMemo(() => {
    const targetW = 640;
    const targetH = 460;

    const availableW = Math.max(280, viewportWidth - (viewportWidth < 640 ? 16 : 32));
    const availableH = Math.max(
      260,
      viewportHeight - (isFullscreen ? (viewportWidth < 640 ? 140 : 120) : viewportWidth < 640 ? 100 : 120)
    );

    const scaleW = availableW / targetW;
    const scaleH = availableH / targetH;

    let computed = Math.min(scaleW, scaleH);

    // Mobile phones bounds
    if (viewportWidth < 640) {
      computed = Math.min(scaleW, 0.95);
      if (computed < 0.44) computed = 0.44;
    } else if (viewportWidth < 1024) {
      computed = Math.min(scaleW, scaleH, 1.05);
    } else {
      computed = Math.min(scaleW, scaleH, isFullscreen ? 1.35 : 1.15);
    }

    return computed;
  }, [viewportWidth, viewportHeight, isFullscreen]);

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
  const totalOccupied = slots.filter((s) => s.status === 'OCCUPIED').length;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-300 flex flex-col items-center justify-center select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none shadow-none pt-[max(4.5rem,calc(env(safe-area-inset-top,36px)+3.5rem))]'
          : 'h-[500px] sm:h-[560px] lg:h-[640px] rounded-2xl border shadow-2xl p-2 sm:p-4'
      } ${
        isLightMode
          ? 'bg-gradient-to-b from-sky-100 via-slate-100 to-slate-200 border-slate-300 shadow-slate-300/60'
          : 'bg-gradient-to-b from-[#0b1220] via-[#080d18] to-[#04070e] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className={`absolute inset-0 pointer-events-none bg-[size:28px_28px] sm:bg-[size:32px_32px] ${
          isLightMode
            ? 'bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,#38bdf808_1px,transparent_1px),linear-gradient(to_bottom,#38bdf808_1px,transparent_1px)]'
        }`}
      />

      {/* Ambient Lighting Glow */}
      <div
        className={`absolute -top-20 -right-20 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none ${
          isLightMode ? 'bg-amber-200/40' : 'bg-cyan-500/10'
        }`}
      />

      {/* TOP FLOATING CONTROL & HUD BAR (Status-Bar Safe for Android Notch & Fullscreen) */}
      <div
        className={`${
          isFullscreen
            ? 'fixed top-0 inset-x-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top,32px))] pb-2.5 px-3 sm:px-6 bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-lg'
            : 'absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-30'
        } flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-auto`}
      >
        {/* Left Side: Yard Title, Live Occupancy, Rate & Buzzer Alert */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Main Title Badge */}
          <div
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium border shadow-xs backdrop-blur-md ${
              isLightMode && !isFullscreen
                ? 'bg-white/95 text-slate-800 border-slate-300 shadow-sm'
                : 'glass-panel text-slate-200 border-slate-700/80 shadow-md'
            }`}
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-bold tracking-tight">SMART LOT</span>
            <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
              {totalOccupied}/3 OCCUPIED
            </span>
          </div>

          {/* Pricing Rate Tag */}
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 dark:text-amber-300 font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-xs">
            <IndianRupee className="w-3 h-3" />
            <span>₹10 / MIN</span>
          </div>

          {/* Ultrasonic Beams Toggle Button */}
          <button
            onClick={() => setShowSensorRays(!showSensorRays)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1.5 border shadow-xs active:scale-95 min-h-[36px] ${
              showSensorRays
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-[0_0_14px_rgba(6,182,212,0.3)]'
                : 'glass-panel text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title="Toggle HC-SR04 Ultrasonic Sonar Ray Beams"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Sonar Beams</span>
          </button>

          {/* Hardware Buzzer Alert Tag if active */}
          {hardwareBuzzerOn && (
            <div className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/50 flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold animate-pulse shadow-sm">
              <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce" />
              <span>BUZZER: ON</span>
            </div>
          )}
        </div>

        {/* Right Side: Camera Perspective Switcher, Zoom, and FULL SCREEN TOGGLE */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          {/* Camera Perspective Group */}
          <div
            className={`flex items-center gap-1 p-0.5 sm:p-1 rounded-xl border shadow-sm backdrop-blur-md ${
              isLightMode && !isFullscreen ? 'bg-white/95 border-slate-300' : 'glass-panel border-slate-700/80'
            }`}
          >
            <button
              onClick={() => setCameraView('isometric')}
              className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center gap-1 min-h-[32px] ${
                cameraView === 'isometric'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3D Isometric Perspective"
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>3D</span>
            </button>

            <button
              onClick={() => setCameraView('driver')}
              className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center gap-1 min-h-[32px] ${
                cameraView === 'driver'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Drive-in Road & Entrance Perspective"
            >
              <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Road</span>
            </button>

            <button
              onClick={() => setCameraView('topdown')}
              className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center gap-1 min-h-[32px] ${
                cameraView === 'topdown'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Top-Down Overhead Plan"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Top</span>
            </button>

            <div className="w-px h-3.5 sm:h-4 mx-0.5 sm:mx-1 bg-slate-700/80" />

            {/* Zoom Controls */}
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 sm:p-1.5 rounded-md transition-colors text-slate-300 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Zoom In (+)"
            >
              <span className="text-xs font-bold leading-none">+</span>
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 sm:p-1.5 rounded-md transition-colors text-slate-300 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Zoom Out (-)"
            >
              <span className="text-xs font-bold leading-none">-</span>
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setCameraView('isometric');
              }}
              className="p-1 sm:p-1.5 rounded-md transition-colors text-slate-300 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* DEDICATED FULL SCREEN TOGGLE BUTTON (Clear from status bar) */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1.5 border shadow-md active:scale-95 whitespace-nowrap min-h-[38px] ${
              isFullscreen
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-600/30 ring-2 ring-rose-400/50'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/50 shadow-cyan-600/30'
            }`}
            title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Expand to Full Screen Only'}
          >
            {isFullscreen ? (
              <>
                <X className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D SCENE VIEWPORT (With Dynamic Responsive Auto-Scaling for Mobile & Laptop) */}
      <div
        className="w-full h-full flex items-center justify-center perspective-1600 overflow-visible select-none mt-8 sm:mt-0"
        style={{ perspectiveOrigin: '50% 50%' }}
      >
        <div
          className={`parking-scene preserve-3d ${getCameraClass()} relative transition-transform duration-700 ease-out`}
          style={{
            transform: `${
              cameraView === 'isometric'
                ? `rotateX(54deg) rotateZ(-28deg) scale(${zoom * autoScale})`
                : cameraView === 'topdown'
                ? `rotateX(0deg) rotateZ(0deg) scale(${zoom * autoScale * 0.95})`
                : `rotateX(68deg) rotateZ(-14deg) scale(${zoom * autoScale * 1.05})`
            }`,
          }}
        >
          {/* REALISTIC HIGH-FIDELITY PARKING YARD COMPLEX PLATFORM */}
          <div
            className="relative w-[630px] h-[450px] rounded-3xl preserve-3d transition-all duration-500"
            style={{
              background: isLightMode
                ? 'radial-gradient(ellipse at 50% 50%, #475569 0%, #1e293b 100%)'
                : 'radial-gradient(ellipse at 50% 50%, #1e2535 0%, #0d131f 100%)',
              boxShadow: isLightMode
                ? '0 35px 70px -15px rgba(30, 41, 59, 0.45), inset 0 2px 4px rgba(255,255,255,0.25), 0 0 0 4px #94a3b8'
                : '0 40px 80px -15px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 3px rgba(255,255,255,0.1)',
              transform: 'translateZ(0px)',
            }}
          >
            {/* 3D Concrete Base Thickness Foundation Edge */}
            <div
              className={`absolute -bottom-4 inset-x-0 h-4 rounded-b-3xl border-x-2 border-b-2 ${
                isLightMode ? 'bg-slate-600 border-slate-700' : 'bg-neutral-900 border-slate-800'
              }`}
              style={{ transform: 'rotateX(-90deg) translateZ(0px)', transformOrigin: 'top' }}
            />

            {/* SIDEWALK & LANDSCAPING GRASS VERGE WITH PLANTERS (LEFT SIDE) */}
            <div
              className={`absolute top-0 left-0 bottom-28 w-10 rounded-tl-3xl border-r-2 preserve-3d flex flex-col items-center justify-between py-4 ${
                isLightMode
                  ? 'bg-emerald-700/80 border-slate-400 grass-texture'
                  : 'bg-emerald-950/60 border-slate-700/80 grass-texture'
              }`}
              style={{ transform: 'translateZ(3px)' }}
            >
              {/* Modern Street Lamp Post with Illuminating Cone */}
              <div
                className="relative flex flex-col items-center preserve-3d"
                style={{ transform: 'translateZ(26px)' }}
              >
                <div className="w-5 h-2.5 rounded-full bg-slate-300 border border-white shadow-[0_0_20px_#fef08a] flex items-center justify-center">
                  <div className="w-2.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
                </div>
                <div className="w-1 h-12 bg-slate-400 shadow-md" />
              </div>

              {/* Miniature Landscaping Trees / Shrubbery */}
              <div className="w-6 h-6 rounded-full bg-emerald-600 border border-emerald-400 shadow-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-700 border border-emerald-500 shadow-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* SIDEWALK & LANDSCAPING GRASS VERGE WITH PARKING TOTEM (RIGHT SIDE) */}
            <div
              className={`absolute top-0 right-0 bottom-28 w-10 rounded-tr-3xl border-l-2 preserve-3d flex flex-col items-center justify-between py-4 ${
                isLightMode
                  ? 'bg-emerald-700/80 border-slate-400 grass-texture'
                  : 'bg-emerald-950/60 border-slate-700/80 grass-texture'
              }`}
              style={{ transform: 'translateZ(3px)' }}
            >
              {/* Blue International Parking Sign Totem on Post */}
              <div
                className="relative flex flex-col items-center preserve-3d"
                style={{ transform: 'translateZ(22px)' }}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm font-sans">P</span>
                </div>
                <div className="w-1 h-9 bg-slate-400 shadow-sm" />
              </div>

              {/* Shrub */}
              <div className="w-6 h-6 rounded-full bg-emerald-600 border border-emerald-400 shadow-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* REAR PARKING YARD CURB & RATE BANNER EMBANKMENT WALL */}
            <div
              className={`absolute top-0 inset-x-10 h-12 border-b flex items-center justify-between px-5 preserve-3d ${
                isLightMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-[#111726] border-slate-700/70 text-slate-300'
              }`}
              style={{ transform: 'translateZ(2px)' }}
            >
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-white">AUTOMATED SMART PARKING FACILITY</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300 opacity-90">
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 font-bold">
                  RATE: ₹10 / MIN
                </span>
                <span className="text-cyan-400 font-bold hidden sm:inline">
                  AUTO PAYMENT ON EXIT
                </span>
              </div>
            </div>

            {/* THE 3 REALISTIC PARKING BAYS (SLOT 1, SLOT 2, SLOT 3) */}
            <div
              className="absolute top-12 inset-x-10 bottom-32 flex items-center justify-between px-3 gap-3 preserve-3d"
              style={{ transform: 'translateZ(1px)' }}
            >
              {slots.map((slot) => {
                const isOccupied = slot.status === 'OCCUPIED';
                const isEmpty = slot.status === 'EMPTY' || slot.status === 'AVAILABLE';
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => onSlotClick && onSlotClick(slot.id)}
                    className={`relative flex-1 h-full rounded-2xl preserve-3d transition-all duration-500 cursor-pointer group flex flex-col items-center justify-between py-2 px-1.5 ${
                      isOccupied
                        ? 'border-2 border-rose-500/90 bg-rose-950/30 shadow-[0_0_24px_rgba(244,63,94,0.4)]'
                        : isEmpty
                        ? 'border-2 border-emerald-500/90 bg-emerald-950/25 shadow-[0_0_24px_rgba(16,185,129,0.35)]'
                        : 'border-2 border-slate-600 bg-slate-900/30'
                    } ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-[1.01]'
                        : ''
                    }`}
                  >
                    {/* Painted Thermoplastic Yellow Double Stall Markings */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none border border-yellow-400/40" />

                    {/* Floor Underglow Neon Halo (Green Free, Red Occupied) */}
                    <div
                      className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-700 ${
                        isOccupied
                          ? 'bg-rose-500/15 shadow-[inset_0_0_24px_rgba(244,63,94,0.4)]'
                          : isEmpty
                          ? 'bg-emerald-500/15 shadow-[inset_0_0_24px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-500/5'
                      }`}
                    />

                    {/* TOP BAY BAR: Lot ID & Collection Meter Tag */}
                    <div className="w-full flex items-center justify-between px-2 pt-0.5 z-20">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-black tracking-wider text-white bg-slate-950/90 px-2 py-0.5 rounded border border-white/20 shadow-xs">
                          {slot.name.toUpperCase().startsWith('LOT') ? slot.name : `LOT ${slot.id}`}
                        </span>
                      </div>

                      {/* Lot Total Collection Badge */}
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-amber-400/40 tabular-nums">
                        TOTAL: ₹{slot.totalCollection || 0}
                      </span>
                    </div>

                    {/* OVERHEAD HC-SR04 ULTRASONIC SENSOR GANTRY */}
                    <div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 preserve-3d flex flex-col items-center pointer-events-none z-40"
                      style={{ transform: 'translateZ(50px)' }}
                    >
                      {/* Overhead Beacon Dome Lamp */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${
                          isOccupied
                            ? 'bg-rose-500 border-rose-200 shadow-[0_0_20px_#f43f5e]'
                            : isEmpty
                            ? 'bg-emerald-500 border-emerald-200 shadow-[0_0_20px_#10b981]'
                            : 'bg-slate-600 border-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-80" />
                      </div>

                      {/* HC-SR04 Ultrasonic Transducer Module Housing (Dual Silver Eyes) */}
                      <div className="mt-0.5 px-1 py-0.5 rounded bg-blue-950 border border-cyan-400 shadow-md flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center">
                          <div className="w-0.5 h-0.5 rounded-full bg-black" />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center">
                          <div className="w-0.5 h-0.5 rounded-full bg-black" />
                        </div>
                      </div>

                      {/* Transducer Support Stem */}
                      <div className="w-1 h-6 bg-slate-400 shadow-sm" />

                      {/* Ultrasonic Sonar Ray Beaming Down */}
                      {showSensorRays && (
                        <div
                          className={`w-0.5 h-16 pointer-events-none transition-all duration-500 ${
                            isOccupied
                              ? 'bg-gradient-to-b from-rose-500 to-transparent'
                              : isEmpty
                              ? 'bg-gradient-to-b from-emerald-500 to-transparent'
                              : 'bg-gradient-to-b from-slate-400 to-transparent'
                          }`}
                          style={{
                            boxShadow: isOccupied
                              ? '0 0 10px rgba(244,63,94,0.9)'
                              : isEmpty
                              ? '0 0 10px rgba(16,185,129,0.9)'
                              : 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* HEAVY-DUTY RUBBER WHEEL STOP WITH REFLECTIVE HAZARD CHEVRONS */}
                    <div
                      className="w-24 h-2.5 rounded-xs bg-neutral-900 border border-slate-500 shadow-lg flex items-center justify-around px-1 z-20 rumble-strip"
                      style={{ transform: 'translateZ(5px)' }}
                      title="Rubber Wheel Stop Curb"
                    />

                    {/* CENTRAL BAY AREA: REALISTIC 3D CAR OR EMPTY LOT GRAPHICS */}
                    <div className="relative w-full flex-1 flex items-center justify-center preserve-3d my-1">
                      {isOccupied ? (
                        <Car3D
                          car={slot.car}
                          slotNumber={slot.id}
                          currentCharge={slot.currentCharge}
                          parkedSince={slot.parkedSince}
                          isLightMode={isLightMode}
                        />
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center gap-1.5 select-none pointer-events-none"
                          style={{ transform: 'translateZ(1px)' }}
                        >
                          {/* Stenciled Highway Road Number Painted on Asphalt */}
                          <div
                            className={`w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center shadow-inner ${
                              isEmpty
                                ? 'border-emerald-400/60 bg-emerald-500/10'
                                : 'border-slate-500/60 bg-slate-500/10'
                            }`}
                          >
                            <span
                              className={`text-3xl font-mono font-black ${
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
                            {isEmpty ? 'AVAILABLE' : 'UNKNOWN'}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            ₹10/min
                          </span>
                        </div>
                      )}
                    </div>

                    {/* BOTTOM TELEMETRY & LIVE CHARGE STRIP */}
                    <div className="w-full flex items-center justify-between px-2 py-1 z-20 text-[10px] font-mono text-slate-200 bg-slate-950/95 rounded-lg border border-white/10 shadow-sm mt-1">
                      <span className="tabular-nums font-semibold flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-cyan-400" />
                        {slot.hasHardwareReading ? `${slot.distance.toFixed(1)} ${slot.unit || 'cm'}` : '--.- cm'}
                      </span>
                      {isOccupied ? (
                        <span className="tabular-nums font-black text-emerald-400 animate-pulse">
                          ₹{(slot.currentCharge || 0).toFixed(2)}
                        </span>
                      ) : (
                        <span className="tabular-nums font-bold text-emerald-400">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INTERNAL CIRCULATION AISLE ROADWAY */}
            <div
              className={`absolute bottom-16 inset-x-10 h-16 border-t-2 border-b-2 flex items-center justify-between px-6 pointer-events-none preserve-3d ${
                isLightMode
                  ? 'border-dashed border-white/60 bg-slate-700/80 asphalt-light'
                  : 'border-dashed border-slate-400/40 bg-slate-900/90 asphalt-dark'
              }`}
              style={{ transform: 'translateZ(1px)' }}
            >
              {/* Directional Driving Arrows Painted on Asphalt Guiding to Bays */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px] font-bold">
                  <span className="text-xl text-yellow-400 font-bold">⬆</span>
                  <span>BAY 1</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px] font-bold">
                  <span className="text-xl text-yellow-400 font-bold">⬆</span>
                  <span>BAY 2</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px] font-bold">
                  <span className="text-xl text-yellow-400 font-bold">⬆</span>
                  <span>BAY 3</span>
                </div>
              </div>

              {/* Internal Speed Limit Marking */}
              <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-white flex items-center justify-center shadow-md">
                <span className="text-black font-black text-[11px] font-sans">10</span>
              </div>

              {/* Wayfinding Aisle Text */}
              <div className="flex items-center gap-2 text-slate-300 font-mono text-[10px] tracking-widest font-semibold opacity-75">
                <span>DRIVEWAY</span>
                <span className="text-white text-base">➔</span>
              </div>
            </div>

            {/* REALISTIC ENTRANCE / EXIT ROAD & PUBLIC ACCESS HIGHWAY (BOTTOM SECTION) */}
            <div
              className={`absolute bottom-0 inset-x-0 h-16 rounded-b-3xl border-t-2 flex items-center justify-between px-5 pointer-events-none preserve-3d ${
                isLightMode
                  ? 'bg-slate-800 border-slate-500 asphalt-light'
                  : 'bg-black/95 border-slate-700 asphalt-dark'
              }`}
              style={{ transform: 'translateZ(2px)' }}
            >
              {/* ENTRANCE GATE COMPLEX: MG995 SERVO BOOM BARRIER + SECURITY KIOSK */}
              <div className="relative flex items-center gap-3 preserve-3d pointer-events-auto">
                {/* Security Guard Booth Cabin */}
                <div
                  className="w-10 h-12 rounded-lg bg-slate-800 border-2 border-slate-500 shadow-xl flex flex-col items-center justify-between p-1 preserve-3d"
                  style={{ transform: 'translateZ(14px)' }}
                  title="Security Booth"
                >
                  <div className="w-full h-2 rounded-t bg-cyan-800 border-b border-cyan-400" />
                  <div className="w-6 h-5 rounded bg-sky-950/80 border border-sky-400/50 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <span className="text-[6px] font-mono text-slate-300 font-bold">GATE</span>
                </div>

                {/* MG995 Servo Motor Housing Post */}
                <div
                  className="relative w-8 h-12 rounded-md bg-amber-500 border-2 border-neutral-900 shadow-2xl flex flex-col items-center justify-between py-1 preserve-3d"
                  style={{ transform: 'translateZ(16px)' }}
                >
                  <div className="w-3 h-3 rounded-full bg-slate-900 border border-amber-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-[7px] font-mono font-black text-black">MG995</span>
                  {/* Gate Status LED */}
                  <div
                    className={`w-3 h-3 rounded-full border border-white ${
                      isGateClosed
                        ? 'bg-red-600 shadow-[0_0_8px_#ef4444]'
                        : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    }`}
                  />
                </div>

                {/* Barrier Boom Arm with Red/White Stripes (Rotates 0° Open, 90° Closed) */}
                <div
                  className="absolute left-18 top-6 w-36 h-2 rounded-r bg-white border border-slate-700 shadow-xl preserve-3d transition-transform duration-700 origin-left curb-hazard"
                  style={{
                    transform: `translateZ(18px) rotateZ(${isGateClosed ? '-85deg' : '0deg'})`,
                  }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-red-600 rounded-r shadow-xs animate-ping opacity-75" />
                </div>
              </div>

              {/* Public Access Highway Wayfinding Text */}
              <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                <div className="flex items-center gap-1 font-bold text-emerald-400">
                  <span>ENTRY / EXIT</span>
                </div>
                <div className="w-1 h-4 bg-slate-700" />
                <span className="text-[10px] hidden sm:inline">LAKHAPAR HIGHWAY ACCESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
