'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ProgressRing } from '@/components/ui/progress-ring';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Hash, BarChart3, BookOpen, ClipboardList } from 'lucide-react';

const INDIGO_PALETTE = ['#4F46E5', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

function subjectAccent(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return INDIGO_PALETTE[Math.abs(h) % INDIGO_PALETTE.length];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attendance/me').catch(() => ({ data: [] })),
      api.get('/leaves/my').catch(() => ({ data: [] })),
    ]).then(([att, lv]) => {
      setAttendance(att.data);
      setLeaves(lv.data);
    }).finally(() => setLoading(false));
  }, []);

  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((s: number, a: any) => s + Number(a.percentage ?? 0), 0) / attendance.length)
    : null;

  const leavesSummary = {
    approved: leaves.filter((l: any) => l.status === 'APPROVED').length,
    pending: leaves.filter((l: any) => l.status === 'PENDING').length,
    rejected: leaves.filter((l: any) => l.status === 'REJECTED').length,
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Profile Header */}
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary via-indigo-400 to-violet-500" />
        <CardContent className="pt-0 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <AvatarInitials name={fullName || 'U'} size="lg" className="ring-4 ring-card shadow-md w-16 h-16 text-xl" />
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">{fullName}</h1>
              {avgAttendance !== null && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${avgAttendance >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                  {avgAttendance}% avg attendance
                </span>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{user?.role ?? 'Student'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Approved Leaves', value: leavesSummary.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: leavesSummary.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Rejected', value: leavesSummary.rejected, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center border border-border ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance rings */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Attendance by Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="w-20 h-24 bg-muted rounded-xl animate-pulse shrink-0" />)}
            </div>
          ) : attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No attendance data available yet.</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-2 flex-wrap">
              {attendance.map((a: any, i) => (
                <ProgressRing
                  key={a.subjectName ?? i}
                  value={Math.round(Number(a.percentage ?? 0))}
                  label={a.subjectName}
                  color={subjectAccent(a.subjectName ?? '')}
                  trackColor="oklch(0.93 0.03 264)"
                  size={92}
                  strokeWidth={8}
                  className="shrink-0"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks per subject - horizontal bars */}
      {attendance.some((a: any) => a.marks !== undefined) && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Marks Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {attendance.map((a: any) => {
              if (a.marks === undefined) return null;
              const pct = Math.min(100, Math.round((a.marks / (a.totalMarks ?? 100)) * 100));
              const color = subjectAccent(a.subjectName ?? '');
              return (
                <div key={a.subjectName}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-foreground">{a.subjectName}</span>
                    <span className="text-sm font-bold" style={{ color }}>{a.marks}/{a.totalMarks ?? 100}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Leave history */}
      {leaves.length > 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> Leave History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {leaves.slice(0, 5).map((l: any) => {
              const statusColors: Record<string,string> = {
                APPROVED: 'bg-emerald-100 text-emerald-700',
                PENDING: 'bg-amber-100 text-amber-700',
                REJECTED: 'bg-rose-100 text-rose-600',
              };
              return (
                <div key={l.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{l.reason ?? 'Leave request'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(l.fromDate ?? l.createdAt).toLocaleDateString()} — {new Date(l.toDate ?? l.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[l.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {l.status}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
