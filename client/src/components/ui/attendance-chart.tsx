'use client';

// Pure SVG chart — no Recharts, guaranteed server/client safe rendering

const DATA = [
  { week: 'Wk 1', DSA: 80, OS: 90, DBMS: 75, CN: 85, Math: 88 },
  { week: 'Wk 2', DSA: 72, OS: 88, DBMS: 80, CN: 78, Math: 92 },
  { week: 'Wk 3', DSA: 85, OS: 76, DBMS: 70, CN: 82, Math: 80 },
  { week: 'Wk 4', DSA: 90, OS: 82, DBMS: 88, CN: 79, Math: 75 },
  { week: 'Wk 5', DSA: 78, OS: 91, DBMS: 84, CN: 88, Math: 83 },
  { week: 'Wk 6', DSA: 88, OS: 85, DBMS: 91, CN: 76, Math: 87 },
];

const LINES = [
  { key: 'DSA' as const, color: '#6366f1' },
  { key: 'OS' as const, color: '#ec4899' },
  { key: 'DBMS' as const, color: '#f59e0b' },
  { key: 'CN' as const, color: '#10b981' },
  { key: 'Math' as const, color: '#3b82f6' },
];

const W = 640; // viewBox width
const H = 200; // viewBox height
const PL = 40; // left padding (Y axis)
const PR = 16; // right padding
const PT = 16; // top padding
const PB = 28; // bottom padding (X axis labels)

const MIN_VAL = 55;
const MAX_VAL = 100;

function toX(i: number) {
  return PL + (i / (DATA.length - 1)) * (W - PL - PR);
}

function toY(v: number) {
  return PT + ((MAX_VAL - v) / (MAX_VAL - MIN_VAL)) * (H - PT - PB);
}

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C ${cpx} ${prev[1]}, ${cpx} ${curr[1]}, ${curr[0]} ${curr[1]}`;
  }
  return d;
}

const Y_TICKS = [60, 70, 80, 90, 100];

export function AttendanceChart() {
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        {Y_TICKS.map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8" fontWeight={600}>
                {v}%
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {DATA.map((d, i) => (
          <text key={d.week} x={toX(i)} y={H - 4} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={600}>
            {d.week}
          </text>
        ))}

        {/* Lines */}
        {LINES.map(({ key, color }) => {
          const points: [number, number][] = DATA.map((d, i) => [toX(i), toY(d[key])]);
          return (
            <path
              key={key}
              d={smoothPath(points)}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data dots */}
        {LINES.map(({ key, color }) =>
          DATA.map((d, i) => (
            <circle
              key={`${key}-${i}`}
              cx={toX(i)} cy={toY(d[key])} r={3.5}
              fill={color} stroke="white" strokeWidth={1.5}
            />
          ))
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {LINES.map(({ key, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            <span className="text-[11px] font-semibold text-slate-500">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
