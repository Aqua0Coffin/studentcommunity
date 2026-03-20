'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string; // Tailwind stroke color class or hex
  trackColor?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 88,
  strokeWidth = 8,
  label,
  sublabel,
  color = '#4F46E5',
  trackColor = '#E0E7FF',
  className,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{value}%</span>
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-foreground text-center leading-tight">{label}</p>}
      {sublabel && <p className="text-[11px] text-muted-foreground text-center">{sublabel}</p>}
    </div>
  );
}
