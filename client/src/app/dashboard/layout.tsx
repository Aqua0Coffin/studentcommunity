'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { GraduationCap } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-white/50">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-medium">Loading your portal…</p>
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 68 : 240;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      {/* Mobile top bar */}
      <TopBar />

      {/* Main content area */}
      <main
        className="transition-all duration-300"
        style={{
          // Desktop: offset by sidebar width
          paddingLeft: undefined,
        }}
      >
        {/* Desktop offset wrapper */}
        <div
          className="hidden lg:block"
          style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease' }}
        >
          <div className="p-8 max-w-6xl mx-auto min-h-screen">
            {children}
          </div>
        </div>

        {/* Mobile content */}
        <div className="lg:hidden pt-14 pb-20 px-4 py-4 max-w-2xl mx-auto">
          <div className="pt-16 pb-4">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
