import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; up: boolean };
  className?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-accent',
  trend,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'animate-fade-up rounded-2xl bg-card border border-border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5 font-medium truncate">{sub}</p>}
        {trend && (
          <p className={cn('text-xs font-semibold mt-1.5', trend.up ? 'text-emerald-600' : 'text-rose-500')}>
            {trend.up ? '▲' : '▼'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
