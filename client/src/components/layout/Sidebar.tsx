'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  ClipboardList,
  User,
  Megaphone,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { AvatarInitials } from '@/components/ui/avatar-initials';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/timetable', label: 'Timetable', icon: CalendarDays },
  { href: '/dashboard/forum', label: 'Forum', icon: MessageSquare },
  { href: '/dashboard/leaves', label: 'Leaves', icon: ClipboardList },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out',
        'glass-panel !rounded-none !border-l-0 !border-t-0 !border-b-0',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('h-16 flex items-center border-b border-white/10 shrink-0', collapsed ? 'justify-center px-0' : 'px-5 gap-3')}>
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-bold tracking-tight text-white whitespace-nowrap overflow-hidden">
            StudentSpace
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 group relative',
                active
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/80')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 text-xs font-semibold bg-white text-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse toggle */}
      <div className="border-t border-white/10 p-2">
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all mb-1"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-2 text-xs font-medium">Collapse</span>}
        </button>

        {user && (
          <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-xl', !collapsed && 'hover:bg-white/10 transition-all')}>
            <AvatarInitials name={`${user.firstName} ${user.lastName}`} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-white/50 truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} title="Sign out" className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        {collapsed && user && (
          <button onClick={logout} title="Sign out" className="w-full flex items-center justify-center py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
