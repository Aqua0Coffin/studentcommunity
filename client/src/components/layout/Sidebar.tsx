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
        'hidden lg:flex flex-col h-screen fixed top-0 left-0 z-30 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('h-16 flex items-center border-b border-sidebar-border shrink-0', collapsed ? 'justify-center px-0' : 'px-5 gap-3')}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground whitespace-nowrap overflow-hidden">
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
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 text-xs font-semibold bg-foreground text-background rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-xl text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all mb-1"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-2 text-xs font-medium">Collapse</span>}
        </button>

        {user && (
          <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-xl', !collapsed && 'hover:bg-sidebar-accent transition-all')}>
            <AvatarInitials name={`${user.firstName} ${user.lastName}`} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-sidebar-foreground truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} title="Sign out" className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground/40 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        {collapsed && user && (
          <button onClick={logout} title="Sign out" className="w-full flex items-center justify-center py-2 rounded-xl text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
