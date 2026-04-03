'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/api';
import { Users, BookOpen, Fingerprint, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, subjects: 0, avgAttendance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [{ count: studentCount }, { count: subjectCount }, { data: attData }] = await Promise.all([
        supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
        supabase.from('Subject').select('*', { count: 'exact', head: true }),
        supabase.from('AttendanceSession').select('status'),
      ]);

      const total = attData?.length || 0;
      const present = attData?.filter(a => a.status === 'PRESENT' || a.status === 'EXCUSED').length || 0;
      const avg = total > 0 ? Math.round((present / total) * 100) : 0;

      setStats({
        students: studentCount || 0,
        subjects: subjectCount || 0,
        avgAttendance: avg,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const STAT_CARDS = [
    { label: 'Registered Students', value: loading ? '—' : stats.students.toLocaleString(), icon: Users, color: 'emerald', href: '/admin/users' },
    { label: 'Active Subjects', value: loading ? '—' : stats.subjects.toString(), icon: BookOpen, color: 'amber', href: '/admin/subjects' },
    { label: 'Avg. Attendance', value: loading ? '—' : `${stats.avgAttendance}%`, icon: Fingerprint, color: 'indigo', href: '/admin/attendance' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Manage Roles', desc: 'Promote or demote user access levels', href: '/admin/users', icon: ShieldAlert, color: 'emerald' },
    { label: 'Manage Subjects', desc: 'Create subjects and enroll students', href: '/admin/subjects', icon: BookOpen, color: 'amber' },
    { label: 'Log Attendance', desc: 'Record attendance for any subject session', href: '/admin/attendance', icon: Clock, color: 'indigo' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
          <p className="text-white/50 mt-1">Welcome back, {user?.firstName}. Here's a live snapshot of the platform.</p>
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          {user?.role}
        </span>
      </div>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STAT_CARDS.map(card => {
          const c = colorMap[card.color];
          return (
            <Link href={card.href} key={card.label} className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30 group hover:bg-white/[0.04] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 ${c.bg} rounded-xl`}>
                  <card.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">{card.value}</p>
                <p className="text-sm font-semibold text-white/50 mt-1">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(action => {
            const c = colorMap[action.color];
            return (
              <Link href={action.href} key={action.label} className={`glass-panel rounded-[1.5rem] p-5 border ${c.border} group hover:bg-white/[0.04] transition-all flex items-start gap-4`}>
                <div className={`p-3 ${c.bg} rounded-xl shrink-0`}>
                  <action.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white">{action.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{action.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/20 shrink-0 mt-1 group-hover:text-white/50 transition-colors ml-auto" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
