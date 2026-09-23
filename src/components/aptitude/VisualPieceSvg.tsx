'use client';

import React from 'react';
import { VisualShapeConfig } from '@/lib/aptitude-games/types';

interface VisualPieceSvgProps {
  config: VisualShapeConfig;
  className?: string;
  size?: number;
}

export default function VisualPieceSvg({ config, className = '', size = 64 }: VisualPieceSvgProps) {
  const center = size / 2;
  const radius = (size / 2) * (config.size || 0.8) * 0.85;

  const renderShapePath = () => {
    switch (config.shape) {
      case 'circle':
        return <circle cx={center} cy={center} r={radius} />;
      case 'square':
        return (
          <rect
            x={center - radius}
            y={center - radius}
            width={radius * 2}
            height={radius * 2}
            rx={2}
          />
        );
      case 'triangle': {
        const h = radius * Math.sqrt(3);
        const p1 = `${center},${center - radius}`;
        const p2 = `${center + radius},${center + h / 2}`;
        const p3 = `${center - radius},${center + h / 2}`;
        return <polygon points={`${p1} ${p2} ${p3}`} />;
      }
      case 'diamond': {
        const p1 = `${center},${center - radius}`;
        const p2 = `${center + radius},${center}`;
        const p3 = `${center},${center + radius}`;
        const p4 = `${center - radius},${center}`;
        return <polygon points={`${p1} ${p2} ${p3} ${p4}`} />;
      }
      case 'cross': {
        const w = radius * 0.35;
        return (
          <path
            d={`M ${center - w} ${center - radius} H ${center + w} V ${center - w} H ${center + radius} V ${center + w} H ${center + w} V ${center + radius} H ${center - w} V ${center + w} H ${center - radius} V ${center - w} H ${center - w} Z`}
          />
        );
      }
      case 'hexagon': {
        const pts: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          pts.push(`${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} />;
      }
      case 'star': {
        const pts: string[] = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? radius : radius * 0.45;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} />;
      }
      default:
        return <circle cx={center} cy={center} r={radius} />;
    }
  };

  const getFillStyle = () => {
    if (config.fill === 'empty') return 'none';
    if (config.fill === 'striped') return 'url(#stripes)';
    if (config.fill === 'dotted') return 'url(#dots)';
    return config.color;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`overflow-visible ${className}`}
    >
      <defs>
        <pattern id="stripes" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke={config.color} strokeWidth="2" />
        </pattern>
        <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={config.color} />
        </pattern>
      </defs>

      {/* Main Transformed Shape */}
      <g
        transform={`rotate(${config.rotation || 0}, ${center}, ${center})`}
        fill={getFillStyle()}
        stroke={config.color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        {renderShapePath()}
      </g>

      {/* Internal Inner Accent (if present) */}
      {config.innerShape === 'dot' && (
        <circle cx={center} cy={center} r={radius * 0.25} fill={config.color} />
      )}
      {config.innerShape === 'circle' && (
        <circle cx={center} cy={center} r={radius * 0.45} fill="none" stroke={config.color} strokeWidth="2" />
      )}

      {/* Internal Dots / Constellation */}
      {config.dotsCount > 0 && (
        <g fill="#ffffff">
          {Array.from({ length: config.dotsCount }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / config.dotsCount;
            const dRad = radius * 0.45;
            return (
              <circle
                key={i}
                cx={center + dRad * Math.cos(angle)}
                cy={center + dRad * Math.sin(angle)}
                r="2.5"
                className="drop-shadow-sm"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
