import React from 'react';
import { CarVisualConfig } from '../types';

interface Car3DProps {
  car: CarVisualConfig;
  slotNumber: number;
  isEntering?: boolean;
}

export const Car3D: React.FC<Car3DProps> = ({ car, slotNumber }) => {
  return (
    <div
      className="relative w-28 h-48 select-none preserve-3d"
      style={{
        animation: 'carEnter 0.75s cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards',
      }}
    >
      {/* Dynamic Ground Shadow */}
      <div
        className="absolute inset-x-2 -bottom-2 h-44 rounded-[28px] bg-black/60 blur-md pointer-events-none transform -translate-z-1"
        style={{ transform: 'translateZ(-2px) scale(0.96)' }}
      />

      {/* Headlight beam projection onto the asphalt in front of car */}
      <div
        className="absolute -top-16 inset-x-0 flex justify-between px-3 pointer-events-none"
        style={{ transform: 'translateZ(1px)' }}
      >
        <div
          className="w-10 h-20 bg-gradient-to-t from-amber-100/35 via-amber-200/15 to-transparent blur-[6px] transform -rotate-6 origin-bottom"
          style={{ clipPath: 'polygon(30% 100%, 70% 100%, 100% 0, 0 0)' }}
        />
        <div
          className="w-10 h-20 bg-gradient-to-t from-amber-100/35 via-amber-200/15 to-transparent blur-[6px] transform rotate-6 origin-bottom"
          style={{ clipPath: 'polygon(30% 100%, 70% 100%, 100% 0, 0 0)' }}
        />
      </div>

      {/* Main Car Body - Lower Chassis */}
      <div
        className="absolute inset-0 rounded-[22px] shadow-2xl preserve-3d border border-white/20 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${car.bodyColor} 0%, #0f172a 100%)`,
          boxShadow: `0 8px 24px -4px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.5)`,
          transform: 'translateZ(6px)',
        }}
      >
        {/* Front Hood with sculpted lines */}
        <div className="absolute top-2 inset-x-3 h-14 rounded-t-[16px] bg-gradient-to-b from-white/25 via-transparent to-black/20 flex flex-col items-center justify-between py-1">
          <div className="w-5 h-1 rounded-full bg-white/40" />
          <div className="w-8 h-0.5 rounded-full bg-black/40" />
        </div>

        {/* Dual LED Headlights */}
        <div className="absolute top-1 inset-x-2 flex justify-between items-center px-1.5 z-20">
          <div className="w-4 h-2.5 rounded-full bg-amber-100 shadow-[0_0_10px_#fef08a] border border-amber-300/80 animate-[headlightFlash_3s_ease-in-out_infinite]" />
          <div className="w-4 h-2.5 rounded-full bg-amber-100 shadow-[0_0_10px_#fef08a] border border-amber-300/80 animate-[headlightFlash_3s_ease-in-out_infinite]" />
        </div>

        {/* Front aerodynamic grille */}
        <div className="absolute top-0 inset-x-8 h-2 rounded-b-md bg-neutral-900 border-x border-b border-neutral-700/80 flex items-center justify-center">
          <div className="w-4 h-0.5 bg-neutral-600 rounded-full" />
        </div>

        {/* Cabin Glass Greenhouse (Elevated 3D tier) */}
        <div
          className="absolute top-12 inset-x-3.5 h-24 rounded-[14px] preserve-3d overflow-hidden border border-cyan-400/30 shadow-inner"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
            transform: 'translateZ(14px)',
          }}
        >
          {/* Windshield Glass Reflection Sheen */}
          <div
            className="absolute -inset-full bg-gradient-to-tr from-transparent via-cyan-200/25 to-transparent pointer-events-none transform -rotate-45"
            style={{ transform: 'rotate(-35deg) translateY(-20%)' }}
          />

          {/* Roof Panel */}
          <div
            className="absolute top-5 inset-x-2 h-14 rounded-[10px] border border-white/20 shadow-md flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${car.roofColor} 0%, #1e293b 100%)`,
              transform: 'translateZ(4px)',
            }}
          >
            {/* Panoramic Sunroof / Carbon stripe */}
            <div className="w-10 h-9 rounded-md bg-black/40 border border-white/10 flex items-center justify-center">
              <span className="text-[7px] font-mono tracking-wider text-white/50 uppercase font-semibold">
                S-{slotNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Side Mirrors */}
        <div
          className="absolute top-14 -left-2 w-2 h-3.5 rounded-l-md bg-neutral-800 border-l border-y border-white/20 shadow-md"
          style={{ transform: 'translateZ(12px) rotateY(-20deg)' }}
        />
        <div
          className="absolute top-14 -right-2 w-2 h-3.5 rounded-r-md bg-neutral-800 border-r border-y border-white/20 shadow-md"
          style={{ transform: 'translateZ(12px) rotateY(20deg)' }}
        />

        {/* 4 Wheels (Rubber tires + silver rim) */}
        <div
          className="absolute top-6 -left-2.5 w-2.5 h-8 rounded-l-md bg-neutral-900 border-l-2 border-slate-600 shadow-md"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute top-6 -right-2.5 w-2.5 h-8 rounded-r-md bg-neutral-900 border-r-2 border-slate-600 shadow-md"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute bottom-6 -left-2.5 w-2.5 h-8 rounded-l-md bg-neutral-900 border-l-2 border-slate-600 shadow-md"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute bottom-6 -right-2.5 w-2.5 h-8 rounded-r-md bg-neutral-900 border-r-2 border-slate-600 shadow-md"
          style={{ transform: 'translateZ(2px)' }}
        />

        {/* Rear Trunk & Spoiler */}
        <div className="absolute bottom-2 inset-x-3.5 h-7 rounded-b-[16px] bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
          {/* License Plate Stencil */}
          <div className="px-1.5 py-0.5 rounded-[3px] bg-neutral-900/90 border border-amber-400/50 shadow-sm">
            <span className="text-[7px] font-mono text-amber-300 font-bold tracking-tight">
              {car.plate}
            </span>
          </div>
        </div>

        {/* Full-width Neon Rear LED Light Strip */}
        <div className="absolute bottom-1 inset-x-2.5 h-1.5 rounded-full bg-rose-600 shadow-[0_0_12px_#e11d48] border border-rose-400/80 z-20 flex justify-between px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
        </div>
      </div>
    </div>
  );
};
