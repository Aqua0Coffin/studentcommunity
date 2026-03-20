'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  BarChart3,
  Clock,
  ClipboardCheck,
  ArrowRight,
  Plus,
  CalendarDays,
  MessageSquare,
  Megaphone,
  Pin,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/announcements').catch(() => ({ data: [] })),
      api.get('/attendance/me').catch(() => ({ data: [] })),
      api.get('/timetable').catch(() => ({ data: [] })),
    ]).then(([ann, att, tt]) => {
      setAnnouncements(ann.data);
      setAttendance(att.data);
      setTimetable(tt.data);
    }).finally(() => setLoading(false));
  }, []);

  // Compute stats
  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((s: number, a: any) => s + Number(a.percentage ?? 0), 0) / attendance.length)
    : null;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = new Date().getDay(); // 0=Sun
  const todayHour = new Date().getHours();
  // Period mapping: period 1 = 9am, 2 = 10am, etc.
  const currentPeriod = todayHour >= 9 ? todayHour - 8 : null;
  const nextClass = currentPeriod
    ? timetable.find((t: any) => t.dayOfWeek === todayDay && t.periodNumber > currentPeriod)
    : timetable.find((t: any) => t.dayOfWeek === todayDay && t.periodNumber >= 1);

  const now = new Date();
  const timeGreeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const pinnedAnn = announcements.filter((a) => a.isPinned).slice(0, 3);
  const recentAnn = announcements.slice(0, 4);

  const quickActions = [
    { label: 'View Timetable', icon: CalendarDays, href: '/dashboard/timetable', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Student Forum', icon: MessageSquare, href: '/dashboard/forum', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
    { label: 'Apply Leave', icon: ClipboardCheck, href: '/dashboard/leaves', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-indigo-400 p-6 text-white shadow-md">
        <p className="text-sm font-medium text-indigo-100 mb-1">{dateLabel}</p>
        <h1 className="text-2xl font-bold">{timeGreeting}, {user?.firstName} 👋</h1>
        <p className="text-indigo-100 text-sm mt-1.5">Here's what's happening today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Avg. Attendance"
          value={loading ? '—' : avgAttendance !== null ? `${avgAttendance}%` : 'N/A'}
          icon={BarChart3}
          iconColor="text-primary"
          iconBg="bg-accent"
          sub={avgAttendance !== null && avgAttendance < 75 ? 'Below 75% threshold' : 'On track'}
          trend={avgAttendance !== null ? { value: avgAttendance >= 75 ? 'Meeting target' : 'Needs attention', up: avgAttendance >= 75 } : undefined}
          delay={50}
        />
        <StatCard
          label="Next Class"
          value={loading ? '—' : nextClass ? nextClass.subjectName : 'No more classes'}
          icon={Clock}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          sub={nextClass ? `Period ${nextClass.periodNumber} · Room ${nextClass.roomNumber}` : 'Enjoy your day!'}
          delay={100}
        />
        <StatCard
          label="Announcements"
          value={loading ? '—' : announcements.length}
          icon={Megaphone}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          sub={`${pinnedAnn.length} pinned`}
          delay={150}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl ${action.bg} hover:opacity-80 transition-opacity group`}
                  >
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                    <span className={`text-xs font-semibold text-center leading-tight ${action.color}`}>{action.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's schedule preview */}
          <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-semibold text-foreground">Today's Classes</CardTitle>
              <Link href="/dashboard/timetable" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Full schedule <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : timetable.filter((t: any) => t.dayOfWeek === todayDay).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                  No classes scheduled today 🎉
                </div>
              ) : (
                <div className="space-y-2">
                  {timetable.filter((t: any) => t.dayOfWeek === todayDay).map((t: any) => {
                    const periodHour = 8 + t.periodNumber;
                    const isCurrent = currentPeriod === t.periodNumber;
                    return (
                      <div key={t.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${isCurrent ? 'bg-accent border-primary/30' : 'bg-card border-border'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          P{t.periodNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{t.subjectName}</p>
                          <p className="text-xs text-muted-foreground">{periodHour}:00 — Room {t.roomNumber}</p>
                        </div>
                        {isCurrent && <span className="text-xs font-bold text-primary bg-accent px-2 py-0.5 rounded-full shrink-0">Now</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column – Announcements */}
        <div>
          <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-semibold text-foreground">Announcements</CardTitle>
              <Link href="/dashboard/announcements" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : recentAnn.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No announcements yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentAnn.map((ann: any) => (
                    <div key={ann.id} className={`p-3 rounded-xl border ${ann.isPinned ? 'border-primary/30 bg-accent' : 'border-border'}`}>
                      <div className="flex items-start gap-2">
                        {ann.isPinned && <Pin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">{ann.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(ann.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
