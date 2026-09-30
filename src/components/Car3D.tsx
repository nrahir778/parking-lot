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
      className="relative w-24 h-44 select-none preserve-3d"
      style={{
        animation: 'carEnter 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      }}
    >
      {/* Realistic Soft Ground Contact Shadow */}
      <div
        className={`absolute inset-x-1 -bottom-2 h-40 rounded-2xl blur-sm pointer-events-none ${
          isLightMode ? 'bg-black/35' : 'bg-black/60'
        }`}
        style={{ transform: 'translateZ(-2px) scale(0.95)' }}
      />

      {/* Main Car Body - Simple, Normal Clean Sedan / Hatchback */}
      <div
        className="absolute inset-0 rounded-2xl preserve-3d border transition-all duration-300 shadow-md"
        style={{
          background: `linear-gradient(180deg, ${car.bodyColor} 0%, ${car.roofColor} 100%)`,
          borderColor: isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)',
          boxShadow: isLightMode
            ? '0 6px 16px -2px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.4)'
            : '0 8px 20px -2px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25)',
          transform: 'translateZ(6px)',
        }}
      >
        {/* Front Hood with subtle center crease line */}
        <div className="absolute top-2 inset-x-2.5 h-12 rounded-t-xl bg-white/10 flex items-center justify-center">
          <div className="w-0.5 h-7 bg-black/20 rounded-full" />
        </div>

        {/* Normal Dual Headlights */}
        <div className="absolute top-1 inset-x-2 flex justify-between items-center px-1 z-20">
          <div className="w-3.5 h-2 rounded-sm bg-amber-100 shadow-[0_0_6px_#fef08a] border border-amber-200" />
          <div className="w-3.5 h-2 rounded-sm bg-amber-100 shadow-[0_0_6px_#fef08a] border border-amber-200" />
        </div>

        {/* Front Bumper / Grille */}
        <div className="absolute top-0 inset-x-5 h-1.5 rounded-b bg-neutral-800" />

        {/* Cabin Glass & Roof (Standard Normal Vehicle Proportions) */}
        <div
          className="absolute top-11 inset-x-2.5 h-22 rounded-xl preserve-3d overflow-hidden border border-slate-700/50"
          style={{
            background: isLightMode
              ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            transform: 'translateZ(10px)',
          }}
        >
          {/* Normal Windshield Glass Sheen */}
          <div
            className="absolute -inset-full bg-gradient-to-tr from-transparent via-cyan-100/20 to-transparent pointer-events-none"
            style={{ transform: 'rotate(-30deg) translateY(-25%)' }}
          />

          {/* Solid Color Car Roof */}
          <div
            className="absolute top-4 inset-x-1.5 h-13 rounded-lg border border-white/15 flex items-center justify-center"
            style={{
              background: car.bodyColor,
              transform: 'translateZ(3px)',
            }}
          >
            <span
              className={`text-[8px] font-mono font-bold tracking-wider ${
                isLightMode ? 'text-black/60' : 'text-white/70'
              }`}
            >
              #{slotNumber}
            </span>
          </div>
        </div>

        {/* Simple Normal Side Mirrors */}
        <div
          className="absolute top-13 -left-1.5 w-1.5 h-3 rounded-l bg-neutral-700 shadow-sm"
          style={{ transform: 'translateZ(9px)' }}
        />
        <div
          className="absolute top-13 -right-1.5 w-1.5 h-3 rounded-r bg-neutral-700 shadow-sm"
          style={{ transform: 'translateZ(9px)' }}
        />

        {/* Standard 4 Wheels (Rubber tires with simple silver rim) */}
        <div
          className="absolute top-5 -left-2 w-2 h-7 rounded-l bg-neutral-900 border-l border-slate-400"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute top-5 -right-2 w-2 h-7 rounded-r bg-neutral-900 border-r border-slate-400"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute bottom-5 -left-2 w-2 h-7 rounded-l bg-neutral-900 border-l border-slate-400"
          style={{ transform: 'translateZ(2px)' }}
        />
        <div
          className="absolute bottom-5 -right-2 w-2 h-7 rounded-r bg-neutral-900 border-r border-slate-400"
          style={{ transform: 'translateZ(2px)' }}
        />

        {/* Rear Trunk & Normal Number Plate */}
        <div className="absolute bottom-2 inset-x-3 h-5 flex items-center justify-center">
          <div className="px-1.5 py-0.5 rounded-[2px] bg-white border border-slate-400 shadow-xs">
            <span className="text-[6.5px] font-mono text-slate-900 font-bold tracking-tight">
              {car.plate}
            </span>
          </div>
        </div>

        {/* Normal Red Taillights */}
        <div className="absolute bottom-1 inset-x-2 flex justify-between items-center px-1 z-20">
          <div className="w-3 h-1.5 rounded-xs bg-red-600 shadow-[0_0_4px_#ef4444]" />
          <div className="w-3 h-1.5 rounded-xs bg-red-600 shadow-[0_0_4px_#ef4444]" />
        </div>
      </div>
    </div>
  );
};
