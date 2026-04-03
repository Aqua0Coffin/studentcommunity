'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AttendanceChart } from '@/components/ui/attendance-chart';
import {
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
  LayoutGrid,
  Video,
  MapPin,
} from 'lucide-react';

// ─── Mock / Static data ──────────────────────────────────────
const ATTENDANCE_DATA = [
  { week: 'Wk 1', DSA: 80, OS: 90, DBMS: 75, CN: 85, Math: 88 },
  { week: 'Wk 2', DSA: 72, OS: 88, DBMS: 80, CN: 78, Math: 92 },
  { week: 'Wk 3', DSA: 85, OS: 76, DBMS: 70, CN: 82, Math: 80 },
  { week: 'Wk 4', DSA: 90, OS: 82, DBMS: 88, CN: 79, Math: 75 },
  { week: 'Wk 5', DSA: 78, OS: 91, DBMS: 84, CN: 88, Math: 83 },
  { week: 'Wk 6', DSA: 88, OS: 85, DBMS: 91, CN: 76, Math: 87 },
];

const SUBJECT_LINES = [
  { key: 'DSA', color: '#6366f1' },
  { key: 'OS', color: '#ec4899' },
  { key: 'DBMS', color: '#f59e0b' },
  { key: 'CN', color: '#10b981' },
  { key: 'Math', color: '#3b82f6' },
];

const UPCOMING_EVENTS = [
  { title: 'National Hackathon', date: 'Fri, 04 Apr', time: '09:00 am', platform: 'Offline', icon: MapPin, color: '#6366f1' },
  { title: 'Coding Contest', date: 'Sat, 05 Apr', time: '02:00 pm', platform: 'HackerRank', icon: LayoutGrid, color: '#ec4899' },
  { title: 'AI/ML Workshop', date: 'Mon, 07 Apr', time: '11:00 am', platform: 'Zoom', icon: Video, color: '#10b981' },
  { title: 'Tech Talk: Web3', date: 'Wed, 09 Apr', time: '04:30 pm', platform: 'Google Meet', icon: Video, color: '#f59e0b' },
];

const SKILLS = [
  { label: 'DSA', value: 78, color: '#6366f1' },
  { label: 'Web Development', value: 85, color: '#3b82f6' },
  { label: 'Problem Solving', value: 72, color: '#10b981' },
  { label: 'Aptitude', value: 63, color: '#f59e0b' },
  { label: 'Communication', value: 80, color: '#ec4899' },
];

// ─── Avatar ring SVG (matches reference circular progress around photo) ──────
function AvatarRing({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const initials = 'KD'; // replaced at runtime below

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#ec4899" strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <foreignObject x={8} y={8} width={size - 16} height={size - 16}>
        <div
          style={{ width: size - 16, height: size - 16, borderRadius: '50%', background: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size / 4, color: '#312e81' }}
        >{initials}</div>
      </foreignObject>
    </svg>
  );
}

// ─── Circular avatar ring with real initials ──────────────────
function ProfileRing({ name, pct, size = 96 }: { name: string; pct: number; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#ec4899" strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <foreignObject x={8} y={8} width={size - 16} height={size - 16}>
        <div
          style={{
            width: size - 16, height: size - 16, borderRadius: '50%',
            background: 'linear-gradient(135deg,#c7d2fe,#818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: Math.round(size / 3.5), color: '#fff',
            letterSpacing: '0.05em',
          }}
        >{initials}</div>
      </foreignObject>
    </svg>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl shadow-lg p-3 text-xs min-w-[130px] !text-slate-900 dark:!text-white">
      <p className="font-bold text-slate-800 dark:text-slate-100 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1">
          <span style={{ color: p.color }} className="font-semibold">{p.dataKey}</span>
          <span className="font-bold text-slate-800">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [subjectCount, setSubjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      setLoading(true);
      
      const { data: attData } = await supabase
        .from('AttendanceSession')
        .select('status')
        .eq('studentId', user.id);
        
      if (attData) setAttendance(attData);

      const { count } = await supabase
        .from('Enrollment')
        .select('*', { count: 'exact', head: true })
        .eq('studentId', user.id);
        
      setSubjectCount(count || 0);
      setLoading(false);
    }
    
    fetchDashboardData();
  }, [user]);

  const totalSessions = attendance.length;
  const presentSessions = attendance.filter(a => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
  const avgPct = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Kiki Dev';

  return (
    <div className="min-h-screen relative z-10 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">

        {/* ── TOP HEADER ─────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-0.5">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {user?.firstName ?? 'Kiki'}&nbsp;
              <span className="text-white/40 font-normal text-lg">— Your personal dashboard overview</span>
            </h1>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── ROW 1: Profile + Stat Cards ──────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Profile Card */}
          <div className="glass-panel-light rounded-[1.75rem] p-5 flex flex-col items-center gap-3">
            <div className="w-full flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">Profile</span>
              <RefreshCw className="w-4 h-4 text-white/40 cursor-pointer hover:text-white transition-colors" />
            </div>
            <ProfileRing name={fullName} pct={avgPct} size={96} />
            <div className="text-center">
              <p className="font-bold text-[15px] text-white">{fullName}</p>
              <p className="text-xs text-white/50 mt-0.5">{user?.role === 'FACULTY' ? 'Faculty' : 'B.Tech — Computer Science'}</p>
            </div>
            <div className="flex items-center gap-5 mt-2 w-full justify-center">
              <div className="text-center">
                <p className="text-base font-bold text-white">{avgPct}%</p>
                <p className="text-[10px] text-white/40 font-medium">Attendance</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-base font-bold text-white">{subjectCount}</p>
                <p className="text-[10px] text-white/40 font-medium">Subjects</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-base font-bold text-white">2</p>
                <p className="text-[10px] text-white/40 font-medium">Leaves</p>
              </div>
            </div>
          </div>

          {/* Avg Attendance Gradient Card */}
          <div
            className="rounded-[1.75rem] shadow-xl p-6 flex flex-col justify-between min-h-[180px] relative overflow-hidden border border-white/20"
            style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.75) 0%, rgba(124, 58, 237, 0.75) 40%, rgba(79, 70, 229, 0.85) 100%)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-start justify-between">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Average Attendance</p>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-white leading-none mt-2">{loading ? '—' : `${avgPct}%`}</p>
              <p className="text-white/70 text-xs font-medium mt-2">
                {avgPct >= 75 ? 'Above threshold · On track' : 'Below 75% · Needs attention'}
              </p>
            </div>
            {/* Decorative circle */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-10 w-20 h-20 rounded-full bg-white/10" />
          </div>

          {/* Subjects Overview Gradient Card */}
          <div
            className="rounded-[1.75rem] shadow-xl p-6 flex flex-col justify-between min-h-[180px] relative overflow-hidden border border-white/20"
            style={{ background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.75) 0%, rgba(34, 211, 238, 0.75) 40%, rgba(8, 145, 178, 0.85) 100%)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-start justify-between">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Subjects Overview</p>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-white leading-none mt-2">{loading ? '—' : subjectCount}</p>
              <p className="text-white/70 text-xs font-medium mt-2">Active subjects enrolled</p>
            </div>
            {/* Floating pill badges */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {['DSA', 'OS', 'DBMS', 'CN', 'Math'].slice(0, subjectCount || 5).map((s) => (
                <span key={s} className="text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
          </div>
        </div>

        {/* ── ROW 2: Main Content + Right Panel ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── LEFT: Chart + Quick Links ─────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Attendance Analytics Chart */}
            <div className="glass-panel-light rounded-[1.75rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-bold text-white">Attendance Analytics</h2>
                  <p className="text-xs text-white/40 mt-0.5">Weekly attendance % per subject</p>
                </div>
                <span className="text-xs font-semibold text-white/50 bg-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                  This semester ↓
                </span>
              </div>

              <AttendanceChart />
            </div>

            {/* Quick Navigation tiles (like "Trackers connected" row) */}
            <div className="glass-panel-light rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white">Quick Navigation</p>
                <span className="text-xs text-white/40">5 sections available</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Dashboard', href: '/dashboard', emoji: '🏠' },
                  { label: 'Timetable', href: '/dashboard/timetable', emoji: '📅' },
                  { label: 'Forum', href: '/dashboard/forum', emoji: '💬' },
                  { label: 'Leaves', href: '/dashboard/leaves', emoji: '📋' },
                  { label: 'Profile', href: '/dashboard/profile', emoji: '👤' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 transition-all group"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[10px] font-semibold text-white/50 text-center leading-tight group-hover:text-white transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ──────────────────────────── */}
          <div className="space-y-4">

            {/* Upcoming Events (replaces My Meetings) */}
            <div className="glass-panel-light rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-white">Upcoming Events</h2>
                <Link href="/dashboard/announcements" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors">
                  See all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-4">
                {UPCOMING_EVENTS.map((ev) => (
                  <div key={ev.title} className="flex items-start gap-3">
                    <div className="shrink-0 min-w-[52px] text-right">
                      <p className="text-[10px] font-bold text-white/40 leading-tight">{ev.date.split(',')[0]}</p>
                      <p className="text-[11px] font-bold text-white/70">{ev.date.split(',')[1]?.trim()}</p>
                    </div>
                    <div className="w-px self-stretch bg-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-white/40">{ev.time}</span>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: `${ev.color}25`, color: ev.color }}>
                          <ev.icon className="w-2.5 h-2.5" /> {ev.platform}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Progress (replaces Developed Areas) */}
            <div className="glass-panel-light rounded-[1.75rem] p-5">
              <div className="mb-4">
                <h2 className="text-[15px] font-bold text-white">Skill Progress</h2>
                <p className="text-xs text-white/40 mt-0.5">Self-assessed proficiency areas</p>
              </div>
              <div className="space-y-4">
                {SKILLS.map((skill) => (
                  <div key={skill.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-white/80">{skill.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{skill.value}%</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${skill.value}%`, background: skill.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
