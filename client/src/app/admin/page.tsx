'use client';

import { useAuth } from '@/context/AuthContext';
import { Users, BookOpen, Fingerprint } from 'lucide-react';

export default function AdminOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
        <p className="text-white/50 mt-1">Welcome back, {user?.firstName}. Operating System at conditional capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-white">4,291</p>
            <p className="text-sm font-semibold text-white/50 mt-1">Registered Students</p>
          </div>
        </div>

        <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-white">18</p>
            <p className="text-sm font-semibold text-white/50 mt-1">Active Subjects</p>
          </div>
        </div>

        <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Fingerprint className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-white">82%</p>
            <p className="text-sm font-semibold text-white/50 mt-1">Average Attendance</p>
          </div>
        </div>
      </div>
{/* 
      <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30 min-h-[300px] flex items-center justify-center">
        <p className="text-white/40 font-semibold tracking-wider uppercase text-sm">System Analytics Offline (Prototype)</p>
      </div> */}
    </div>
  );
}
