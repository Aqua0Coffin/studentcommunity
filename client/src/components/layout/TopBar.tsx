'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, GraduationCap, Menu } from 'lucide-react';
import { AvatarInitials } from '@/components/ui/avatar-initials';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/timetable': 'Timetable',
  '/dashboard/forum': 'Forum',
  '/dashboard/leaves': 'Leaves',
  '/dashboard/profile': 'Profile',
};

export function TopBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] ?? 'StudentSpace';

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border h-14 flex items-center px-4 gap-3">
      {/* Logo mark */}
      <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
        <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
      </div>

      {/* Page title */}
      <span className="flex-1 text-[15px] font-bold text-foreground">{title}</span>

      {/* Right actions */}
      <button className="p-2 rounded-xl hover:bg-accent transition-colors relative">
        <Bell className="w-4.5 h-4.5 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
      </button>
      {user && (
        <AvatarInitials name={`${user.firstName} ${user.lastName}`} size="sm" className="cursor-pointer" />
      )}
    </header>
  );
}
