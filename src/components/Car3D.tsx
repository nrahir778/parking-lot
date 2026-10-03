import React from 'react';
import { CarVisualConfig } from '../types';

interface Car3DProps {
  car: CarVisualConfig;
  slotNumber: number;
  isLightMode?: boolean;
}

export const Car3D: React.FC<Car3DProps> = ({ car, slotNumber, isLightMode = false }) => {
  return (
    <div
      className="relative w-22 h-36 select-none preserve-3d"
      style={{
        animation: 'carEnter 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      }}
    >
      {/* Headlight Beams illuminating the road forward */}
      <div
        className="absolute -top-12 inset-x-0 h-14 pointer-events-none opacity-40 blur-xs"
        style={{
          background: 'linear-gradient(to top, rgba(254, 240, 138, 0.5) 0%, transparent 100%)',
          clipPath: 'polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)',
          transform: 'translateZ(1px)',
        }}
      />

      {/* Realistic Soft Contact Shadow on Asphalt Road */}
      <div
        className={`absolute inset-x-1 -bottom-2 h-36 rounded-2xl blur-xs pointer-events-none ${
          isLightMode ? 'bg-black/40' : 'bg-black/70'
        }`}
        style={{ transform: 'translateZ(-1px) scale(0.96)' }}
      />

      {/* Main Car Body - Simple, Normal Realistic Sedan / Hatchback */}
      <div
        className="absolute inset-0 rounded-2xl preserve-3d border transition-all duration-300 shadow-md"
        style={{
          background: `linear-gradient(180deg, ${car.bodyColor} 0%, ${car.roofColor} 100%)`,
          borderColor: isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)',
          boxShadow: isLightMode
            ? '0 6px 14px -2px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)'
            : '0 8px 18px -2px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.3)',
          transform: 'translateZ(6px)',
        }}
      >
        {/* Front Hood with subtle center crease line */}
        <div className="absolute top-2 inset-x-2 h-10 rounded-t-xl bg-white/10 flex items-center justify-center">
          <div className="w-0.5 h-6 bg-black/20 rounded-full" />
        </div>

        {/* Normal Dual Projector Headlights */}
        <div className="absolute top-1 inset-x-1.5 flex justify-between items-center px-1 z-20">
          <div className="w-3 h-2 rounded-xs bg-amber-100 shadow-[0_0_8px_#fef08a] border border-amber-300" />
          <div className="w-3 h-2 rounded-xs bg-amber-100 shadow-[0_0_8px_#fef08a] border border-amber-300" />
        </div>

        {/* Front Bumper / Radiator Grille */}
        <div className="absolute top-0 inset-x-4 h-1.5 rounded-b bg-neutral-900 border-x border-neutral-700" />

        {/* Cabin Glass & Roof (Standard Normal Vehicle Proportions) */}
        <div
          className="absolute top-9 inset-x-2 h-18 rounded-xl preserve-3d overflow-hidden border border-slate-700/60"
          style={{
            background: isLightMode
              ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            transform: 'translateZ(8px)',
          }}
        >
          {/* Normal Windshield Glass Sheen */}
          <div
            className="absolute -inset-full bg-gradient-to-tr from-transparent via-cyan-100/25 to-transparent pointer-events-none"
            style={{ transform: 'rotate(-30deg) translateY(-25%)' }}
          />

          {/* Solid Color Car Roof with subtle antenna */}
          <div
            className="absolute top-3 inset-x-1.5 h-11 rounded-lg border border-white/20 flex items-center justify-center"
            style={{
              background: car.bodyColor,
              transform: 'translateZ(3px)',
            }}
          >
            <span
              className={`text-[8px] font-mono font-bold tracking-wider ${
                isLightMode ? 'text-black/60' : 'text-white/80'
              }`}
            >
              #{slotNumber}
            </span>
          </div>
        </div>

        {/* Simple Normal Side Mirrors */}
        <div
          className="absolute top-11 -left-1.5 w-1.5 h-2.5 rounded-l bg-neutral-800 shadow-xs"
          style={{ transform: 'translateZ(8px)' }}
        />
        <div
          className="absolute top-11 -right-1.5 w-1.5 h-2.5 rounded-r bg-neutral-800 shadow-xs"
          style={{ transform: 'translateZ(8px)' }}
        />

        {/* Standard 4 Wheels (Rubber tires with silver alloy rims) */}
        <div
          className="absolute top-4 -left-2 w-2 h-6 rounded-l bg-neutral-950 border-l border-slate-300 shadow-sm"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute top-4 -right-2 w-2 h-6 rounded-r bg-neutral-950 border-r border-slate-300 shadow-sm"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute bottom-4 -left-2 w-2 h-6 rounded-l bg-neutral-950 border-l border-slate-300 shadow-sm"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute bottom-4 -right-2 w-2 h-6 rounded-r bg-neutral-950 border-r border-slate-300 shadow-sm"
          style={{ transform: 'translateZ(2px)' }}
        />

        {/* Rear Trunk & Normal Number Plate */}
        <div className="absolute bottom-1.5 inset-x-2.5 h-4 flex items-center justify-center">
          <div className="px-1.5 py-0.5 rounded-[2px] bg-white border border-slate-400 shadow-xs">
            <span className="text-[6px] font-mono text-slate-900 font-bold tracking-tight">
              {car.plate}
            </span>
          </div>
        </div>

        {/* Normal Red Taillights */}
        <div className="absolute bottom-0.5 inset-x-1.5 flex justify-between items-center px-1 z-20">
          <div className="w-2.5 h-1 rounded-xs bg-red-600 shadow-[0_0_4px_#ef4444]" />
          <div className="w-2.5 h-1 rounded-xs bg-red-600 shadow-[0_0_4px_#ef4444]" />
        </div>
      </div>
    </div>
  );
};
