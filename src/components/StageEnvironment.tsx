'use client';

import React from 'react';

export default function StageEnvironment() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Deep Studio Atmosphere */}
      <div className="absolute inset-0 bg-[#06070a]" />

      {/* 2. Studio Spotlights & Ambience */}
      <div className="absolute inset-0 studio-spotlight-left" />
      <div className="absolute inset-0 studio-spotlight-right" />

      {/* 3. Golden Architectural Back Columns / Stage Trusses */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        {/* Left Stage Columns */}
        <div className="absolute top-0 left-[6%] w-16 h-full bg-gradient-to-b from-amber-500/20 via-amber-700/5 to-transparent blur-sm" />
        <div className="absolute top-0 left-[12%] w-12 h-full bg-gradient-to-b from-amber-500/15 via-transparent to-transparent blur-md" />

        {/* Right Stage Columns */}
        <div className="absolute top-0 right-[6%] w-16 h-full bg-gradient-to-b from-amber-500/20 via-amber-700/5 to-transparent blur-sm" />
        <div className="absolute top-0 right-[12%] w-12 h-full bg-gradient-to-b from-amber-500/15 via-transparent to-transparent blur-md" />

        {/* Distant Stage Grid Lights */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
      </div>

      {/* 4. Glossy Stage Floor with Warm Golden Light Reflection */}
      <div className="absolute bottom-0 left-0 w-full h-[38%] stage-floor-reflection border-t border-amber-500/10" />

      {/* Radial Pedestal Floor Glow */}
      <div className="absolute bottom-[10%] left-[34%] -translate-x-1/2 w-[520px] h-[160px] rounded-full bg-amber-500/15 blur-2xl transform scale-y-50" />
      <div className="absolute bottom-[13%] left-[34%] -translate-x-1/2 w-[340px] h-[80px] rounded-full bg-yellow-400/20 blur-xl transform scale-y-50" />
    </div>
  );
}
