'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500">Loading your portal...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Community</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" className="block px-4 py-3 rounded-xl font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-all">
            Announcements
          </Link>
          <Link href="/dashboard/timetable" className="block px-4 py-3 rounded-xl font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-all">
            Timetable
          </Link>
          <Link href="/dashboard/leaves" className="block px-4 py-3 rounded-xl font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-all">
            Leaves & Attendance
          </Link>
          <Link href="/dashboard/forum" className="block px-4 py-3 rounded-xl font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-all">
            Student Forum
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50">
          <div className="px-4 py-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs font-medium text-slate-500 truncate mb-4">{user.email}</p>
          </div>
          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all text-sm font-bold">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
