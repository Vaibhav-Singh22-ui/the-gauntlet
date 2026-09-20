'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WheelColor, WHEEL_COLORS_CONFIG } from '@/types/game';
import { audio } from '@/lib/audio';
import { Play } from 'lucide-react';

interface WheelProps {
  selectedColor?: WheelColor | null;
  isSpinning: boolean;
  onSpinComplete?: (color: WheelColor) => void;
  disabled?: boolean;
  onSpinStart?: () => void;
}

// Exactly 6 distinct sectors corresponding to the 6 gameplay colors
const SECTOR_COLORS: WheelColor[] = ['GREEN', 'BLUE', 'VIOLET', 'RED', 'YELLOW', 'PINK'];
const SECTOR_COUNT = 6;
const SECTOR_ANGLE = 360 / SECTOR_COUNT; // 60 degrees each

export default function Wheel({
  selectedColor,
  isSpinning,
  onSpinComplete,
  disabled = false,
  onSpinStart,
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isPointerTicking, setIsPointerTicking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTickIndexRef = useRef<number>(-1);

  // 6 Sectors with metadata
  const sectors = React.useMemo(() => {
    return SECTOR_COLORS.map((color, index) => ({
      index,
      color,
      startAngle: index * SECTOR_ANGLE,
      endAngle: (index + 1) * SECTOR_ANGLE,
    }));
  }, []);

  // HiDPI Canvas Painter for physical game-show wheel
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width; // 800px HiDPI
      const center = size / 2;
      const outerRadius = center - 44;

      ctx.clearRect(0, 0, size, size);

      // 1. Heavy Stage Shadow
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center + 12, outerRadius + 20, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 50;
      ctx.fill();
      ctx.restore();

      // 2. Heavy Gold / Bronze Outer Bezel (Multi-tier)
      ctx.save();
      const outerBezelGrad = ctx.createLinearGradient(0, 0, size, size);
      outerBezelGrad.addColorStop(0, '#fef08a');
      outerBezelGrad.addColorStop(0.2, '#d97706');
      outerBezelGrad.addColorStop(0.4, '#78350f');
      outerBezelGrad.addColorStop(0.6, '#f59e0b');
      outerBezelGrad.addColorStop(0.8, '#b45309');
      outerBezelGrad.addColorStop(1, '#451a03');

      ctx.beginPath();
      ctx.arc(center, center, outerRadius + 28, 0, 2 * Math.PI);
      ctx.fillStyle = outerBezelGrad;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
      ctx.shadowBlur = 30;
      ctx.fill();

      // Inset dark groove of bezel
      ctx.beginPath();
      ctx.arc(center, center, outerRadius + 20, 0, 2 * Math.PI);
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Inner golden ring of bezel
      const innerBezelGrad = ctx.createLinearGradient(size, 0, 0, size);
      innerBezelGrad.addColorStop(0, '#fde68a');
      innerBezelGrad.addColorStop(0.5, '#b45309');
      innerBezelGrad.addColorStop(1, '#fef08a');
      ctx.beginPath();
      ctx.arc(center, center, outerRadius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = innerBezelGrad;
      ctx.lineWidth = 5;
      ctx.stroke();

      // 36 Glowing Gold LED Studs around perimeter
      const bulbCount = 36;
      for (let i = 0; i < bulbCount; i++) {
        const rad = (i * (360 / bulbCount) * Math.PI) / 180;
        const bx = center + (outerRadius + 14) * Math.cos(rad);
        const by = center + (outerRadius + 14) * Math.sin(rad);

        // Stud socket
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#292524';
        ctx.fill();

        // Glowing jewel LED
        ctx.beginPath();
        ctx.arc(bx, by, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#f59e0b';
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.restore();

      // 3. Wheel Sectors (Rotated Disc)
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((angle * Math.PI) / 180);

      sectors.forEach((sec) => {
        const startRad = (sec.startAngle * Math.PI) / 180;
        const endRad = (sec.endAngle * Math.PI) / 180;
        const config = WHEEL_COLORS_CONFIG[sec.color];

        // Sector Wedge
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, startRad, endRad);
        ctx.closePath();

        // 3D Radial Gradient for rich color depth
        const grad = ctx.createRadialGradient(0, 0, 40, 0, 0, outerRadius);
        grad.addColorStop(0, '#ffffff55');
        grad.addColorStop(0.25, config.hex);
        grad.addColorStop(0.85, adjustBrightness(config.hex, -18));
        grad.addColorStop(1, adjustBrightness(config.hex, -50));

        ctx.fillStyle = grad;
        ctx.fill();

        // Metallic Spoke Divider
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(outerRadius * Math.cos(startRad), outerRadius * Math.sin(startRad));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Chrome Pin at perimeter tip of spoke
        const px = (outerRadius - 8) * Math.cos(startRad);
        const py = (outerRadius - 8) * Math.sin(startRad);
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Sector Typography
        ctx.save();
        const midRad = startRad + (endRad - startRad) / 2;
        ctx.rotate(midRad);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Dark text outline for maximum legibility
        ctx.font = '900 24px Outfit, sans-serif';
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeText(config.name.toUpperCase(), outerRadius - 42, 0);

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fillText(config.name.toUpperCase(), outerRadius - 42, 0);

        ctx.restore();
      });

      ctx.restore();

      // 4. Center Golden Mechanical Hub (Static Base)
      const hubRadius = 80;
      ctx.save();
      // Hub shadow
      ctx.beginPath();
      ctx.arc(center, center + 4, hubRadius + 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 25;
      ctx.fill();

      // Outer gold bevel ring
      const hubGrad = ctx.createLinearGradient(
        center - hubRadius,
        center - hubRadius,
        center + hubRadius,
        center + hubRadius
      );
      hubGrad.addColorStop(0, '#fef08a');
      hubGrad.addColorStop(0.3, '#f59e0b');
      hubGrad.addColorStop(0.7, '#78350f');
      hubGrad.addColorStop(1, '#fbbf24');

      ctx.beginPath();
      ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
      ctx.fillStyle = hubGrad;
      ctx.fill();

      // Inner dark steel bezel
      ctx.beginPath();
      ctx.arc(center, center, hubRadius - 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#1c1917';
      ctx.stroke();
      ctx.fill();

      ctx.restore();
    },
    [sectors]
  );

  useEffect(() => {
    drawWheel(currentAngle);
  }, [drawWheel, currentAngle]);

  // Synchronized Spin Animation
  useEffect(() => {
    if (!isSpinning || !selectedColor) return;

    audio.playWheelSpin();

    // Pointer is at 12 o'clock (270 degrees in canvas space)
    const targetSector = sectors.find((s) => s.color === selectedColor) || sectors[0];
    const targetMidAngle = targetSector.startAngle + SECTOR_ANGLE / 2;

    let targetNormalized = (270 - targetMidAngle) % 360;
    if (targetNormalized < 0) targetNormalized += 360;

    const minSpins = 6;
    const startAngle = currentAngle;
    const startMod = startAngle % 360;
    let delta = targetNormalized - startMod;
    if (delta <= 0) delta += 360;
    const totalRotation = startAngle + minSpins * 360 + delta;

    const startTime = performance.now();
    const duration = 3800; // 3.8s cinematic duration

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic easing for realistic physical deceleration
      const ease = 1 - Math.pow(1 - progress, 4);
      const angle = startAngle + (totalRotation - startAngle) * ease;

      setCurrentAngle(angle);
      drawWheel(angle);

      // Pointer tick detection
      const topAngle = (270 - angle) % 360;
      const normalizedTop = topAngle < 0 ? topAngle + 360 : topAngle;
      const secIdx = Math.floor(normalizedTop / SECTOR_ANGLE);

      if (secIdx !== lastTickIndexRef.current) {
        lastTickIndexRef.current = secIdx;
        setIsPointerTicking(true);
        setTimeout(() => setIsPointerTicking(false), 50);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        audio.stopWheelSpin();
        if (onSpinComplete) {
          setTimeout(() => {
            onSpinComplete(selectedColor);
          }, 500);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audio.stopWheelSpin();
    };
  }, [isSpinning, selectedColor, sectors, drawWheel, onSpinComplete]);

  const canSpin = !disabled && !isSpinning;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 1. INTERACTIVE WHEEL ASSEMBLY — CLICKING ANYWHERE ON WHEEL TRIGGERS SPIN */}
      <div
        onClick={canSpin ? onSpinStart : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center justify-center transition-transform duration-300 ${
          canSpin
            ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'
            : isSpinning
            ? 'cursor-wait'
            : 'cursor-not-allowed opacity-75'
        }`}
        title={canSpin ? 'Click wheel to spin!' : isSpinning ? 'Wheel is spinning...' : ''}
      >
        {/* Physical 3D Golden Pointer at 12 o'clock */}
        <div
          className={`absolute -top-5 left-1/2 -translate-x-1/2 z-40 transition-transform origin-top ${
            isPointerTicking ? 'animate-pointer-tick' : ''
          }`}
        >
          <div className="relative filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)]">
            {/* Beveled Golden Arrow pointing down */}
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[36px] border-t-amber-400" />
            {/* Jewel Ruby / Amber Pivot Bead */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-b from-yellow-200 via-amber-500 to-red-600 border-2 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </div>
        </div>

        {/* Outer Glow Halo on Hover / Idle */}
        <div
          className={`absolute inset-0 rounded-full filter blur-2xl transition-opacity duration-500 pointer-events-none ${
            canSpin
              ? isHovered
                ? 'opacity-80 bg-amber-500/30'
                : 'opacity-40 bg-amber-500/15 animate-pulse'
              : 'opacity-0'
          }`}
        />

        {/* HiDPI Canvas Wheel (Rendered at 800x800, displayed at 360-390px) */}
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="relative z-10 w-[310px] h-[310px] sm:w-[360px] sm:h-[360px] md:w-[390px] md:h-[390px] rounded-full drop-shadow-2xl"
        />

        {/* 2. CENTER 3D "TAP TO SPIN" PUSH BUTTON */}
        <div className="absolute z-30 flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center text-center transition-all duration-300 shadow-2xl border-2 ${
              canSpin
                ? 'bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-600 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                : isSpinning
                ? 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-[#1e2336] border-slate-700 text-slate-500'
            }`}
          >
            {isSpinning ? (
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-100 uppercase animate-pulse">
                SPINNING
              </span>
            ) : canSpin ? (
              <>
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950 mb-0.5" />
                <span className="text-[11px] sm:text-xs font-black font-display tracking-wider text-slate-950 uppercase leading-none">
                  SPIN
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-950 tracking-tighter uppercase mt-0.5">
                  TAP WHEEL
                </span>
              </>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase">LOCKED</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. CINEMATIC STAGE PEDESTAL (Grounding the Wheel machine) */}
      <div className="relative -mt-6 z-10 flex flex-col items-center pointer-events-none">
        {/* Upper Tier Mount Ring */}
        <div className="w-[280px] sm:w-[330px] h-5 bg-gradient-to-r from-[#141210] via-[#38332f] to-[#141210] border-t border-amber-500/50 rounded-t-full shadow-lg" />
        {/* Lower Grounding Pedestal */}
        <div className="w-[340px] sm:w-[400px] h-6 bg-gradient-to-r from-[#090807] via-[#221e1a] to-[#090807] border-b-2 border-amber-500/70 rounded-b-2xl shadow-[0_10px_30px_rgba(245,158,11,0.25)] flex items-center justify-center">
          <div className="w-3/5 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function adjustBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
