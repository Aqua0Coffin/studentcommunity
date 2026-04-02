'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, Users, BookOpen, Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
        // Prototype guard
        toast.error('Unauthorized: Admin access required.');
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'ADMIN' && user.role !== 'FACULTY')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShieldAlert className="w-10 h-10 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#060408]">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-emerald-900/40 bg-[#0b0a0e] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-10 text-emerald-500">
            <ShieldAlert className="w-8 h-8" />
            <h1 className="text-xl font-extrabold tracking-tight">Admin Portal</h1>
          </div>
          
          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              <ShieldAlert className="w-5 h-5" /> Overview
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white font-medium transition-colors">
              <Users className="w-5 h-5" /> Role Manager
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/50 cursor-not-allowed">
              <BookOpen className="w-5 h-5" /> Subjects (Locked)
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/50 cursor-not-allowed">
              <Clock className="w-5 h-5" /> Mass Logger (Locked)
            </div>
          </nav>
        </div>

        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold mt-auto">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto w-full relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Admin glowing background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]" style={{
        backgroundImage: `radial-gradient(ellipse 70% 60% at 30% -10%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)`
      }} />
    </div>
  );
}
