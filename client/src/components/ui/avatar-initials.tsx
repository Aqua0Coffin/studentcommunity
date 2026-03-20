import { cn } from '@/lib/utils';

const COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface AvatarInitialsProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarInitials({ name, size = 'md', className }: AvatarInitialsProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
  const colorClass = COLORS[hashStr(name) % COLORS.length];

  const sizeClass = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-[13px]',
    lg: 'w-12 h-12 text-[17px]',
  }[size];

  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold shrink-0', colorClass, sizeClass, className)}>
      {initials}
    </div>
  );
}
