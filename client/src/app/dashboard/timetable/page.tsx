'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const PERIOD_TIMES: Record<number, string> = {
  1: '8:00', 2: '9:00', 3: '10:00', 4: '11:00', 5: '12:00', 6: '13:00', 7: '14:00',
};

// Deterministic color from subject name
const SUBJECT_COLORS = [
  { bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { bg: 'bg-sky-100 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  { bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
];

function subjectColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(() => {
    // Default to today (1=Mon ... 5=Fri), or Mon if weekend
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
  });

  useEffect(() => {
    api.get('/timetable')
      .then(({ data }) => setTimetable(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const todayDay = new Date().getDay();
  const currentHour = new Date().getHours();
  const currentPeriod = currentHour >= 8 && currentHour <= 15 ? currentHour - 7 : null;

  const cellFor = (day: number, period: number) =>
    timetable.find((t) => t.dayOfWeek === day && t.periodNumber === period);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Timetable</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your weekly class schedule.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      ) : (
        <>
          {/* ── Mobile: day tabs + single-day list ── */}
          <div className="lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar mb-4">
              {DAYS.map((d, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === todayDay;
                const isActive = dayNum === activeDay;
                return (
                  <button
                    key={d}
                    onClick={() => setActiveDay(dayNum)}
                    className={cn(
                      'flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isToday
                        ? 'border-primary/50 text-primary bg-accent'
                        : 'border-border text-muted-foreground bg-card hover:bg-muted'
                    )}
                  >
                    {d}
                    {isToday && <span className="w-1 h-1 rounded-full bg-current mt-1" />}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{DAY_FULL[activeDay - 1]}</p>
              {PERIODS.map((p) => {
                const cell = cellFor(activeDay, p);
                const isCurrent = activeDay === todayDay && currentPeriod === p;
                if (!cell) return null;
                const { bg, text, border } = subjectColor(cell.subjectName);
                return (
                  <div key={p} className={cn('flex items-center gap-3 p-3.5 rounded-xl border transition-colors', isCurrent ? 'ring-2 ring-primary ring-offset-1' : '', bg, border)}>
                    <div className="text-center shrink-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">P{p}</p>
                      <p className="text-[11px] font-semibold text-muted-foreground">{PERIOD_TIMES[p]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-bold truncate', text)}>{cell.subjectName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{cell.faculty?.firstName} {cell.faculty?.lastName} · Room {cell.roomNumber}</p>
                    </div>
                    {isCurrent && <span className="text-[10px] font-bold text-primary bg-white dark:bg-background px-2 py-0.5 rounded-full shrink-0 border border-primary/30">Now</span>}
                  </div>
                );
              })}
              {PERIODS.every((p) => !cellFor(activeDay, p)) && (
                <div className="text-center py-12 text-muted-foreground text-sm">No classes on {DAY_FULL[activeDay - 1]} 🎉</div>
              )}
            </div>
          </div>

          {/* ── Desktop: weekly grid ── */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="p-3 w-16 text-xs font-bold text-muted-foreground uppercase tracking-wide text-center">Period</th>
                      {DAYS.map((d, i) => {
                        const dayNum = i + 1;
                        const isToday = dayNum === todayDay;
                        return (
                          <th key={d} className={cn('p-3 text-xs font-bold uppercase tracking-wide text-center', isToday ? 'text-primary' : 'text-muted-foreground')}>
                            {d}
                            {isToday && <span className="ml-1 inline-block w-1.5 h-1.5 bg-primary rounded-full align-middle" />}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((p) => {
                      const isCurrPeriod = currentPeriod === p;
                      return (
                        <tr key={p} className={cn('border-b border-border last:border-0', isCurrPeriod && 'bg-accent/30')}>
                          <td className="p-2 text-center border-r border-border">
                            <p className="text-[11px] font-bold text-muted-foreground">P{p}</p>
                            <p className="text-[10px] text-muted-foreground/60">{PERIOD_TIMES[p]}</p>
                          </td>
                          {DAYS.map((d, i) => {
                            const dayNum = i + 1;
                            const cell = cellFor(dayNum, p);
                            const isToday = dayNum === todayDay;
                            const isCurrent = isToday && isCurrPeriod;
                            if (!cell) {
                              return (
                                <td key={d} className={cn('p-2 text-center', isToday && 'bg-accent/10')}>
                                  <span className="text-muted-foreground/30 text-xs">—</span>
                                </td>
                              );
                            }
                            const { bg, text, border } = subjectColor(cell.subjectName);
                            return (
                              <td key={d} className={cn('p-2', isToday && 'bg-accent/10')}>
                                <div className={cn('rounded-xl p-2.5 border text-center', bg, border, isCurrent && 'ring-2 ring-primary ring-offset-1')}>
                                  <p className={cn('text-[12px] font-bold leading-tight', text)}>{cell.subjectName}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">Rm {cell.roomNumber}</p>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
