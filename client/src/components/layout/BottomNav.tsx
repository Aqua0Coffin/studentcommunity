'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  ClipboardList,
  User,
} from 'lucide-react';

const TAB_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/timetable', label: 'Schedule', icon: CalendarDays },
  { href: '/dashboard/forum', label: 'Forum', icon: MessageSquare },
  { href: '/dashboard/leaves', label: 'Leaves', icon: ClipboardList },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: typeof TAB_ITEMS[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel !rounded-none !border-b-0 !border-l-0 !border-r-0">
      <div className="flex items-stretch h-16 px-1">
        {TAB_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-150 rounded-xl mx-0.5 my-1.5',
                active
                  ? 'text-indigo-400'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <div className={cn('p-1.5 rounded-xl transition-colors', active && 'bg-white/10')}>
                <item.icon className={cn('w-5 h-5', active ? 'text-indigo-400' : 'text-white/40')} />
              </div>
              <span className={cn(active && 'text-indigo-400')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
