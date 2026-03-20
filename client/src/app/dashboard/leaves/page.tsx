'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ClipboardList, CalendarRange, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarInitials } from '@/components/ui/avatar-initials';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; bar: string }> = {
  APPROVED: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2, bar: 'bg-emerald-500' },
  REJECTED: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-300', icon: XCircle, bar: 'bg-rose-500' },
  PENDING: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-300', icon: Clock, bar: 'bg-amber-400' },
};

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = () => {
    setLoading(true);
    api.get('/leaves')
      .then(({ data }) => setLeaves(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLeaves(); }, []);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves', { reason, startDate, endDate });
      toast.success('Leave requested successfully');
      setReason(''); setStartDate(''); setEndDate('');
      loadLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      loadLeaves();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const pending = leaves.filter((l) => l.status === 'PENDING').length;
  const approved = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejected = leaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leaves &amp; Attendance</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage leave requests and track your records.</p>
      </div>

      {/* Summary pills */}
      {!loading && leaves.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Approved', count: approved, ...STATUS_STYLES.APPROVED },
            { label: 'Pending', count: pending, ...STATUS_STYLES.PENDING },
            { label: 'Rejected', count: rejected, ...STATUS_STYLES.REJECTED },
          ].map((s) => (
            <div key={s.label} className={cn('flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold', s.bg, s.text, 'border-current/20')}>
              <s.icon className="w-4 h-4" />
              {s.count} {s.label}
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Apply form */}
        {user?.role === 'STUDENT' && (
          <div className="md:col-span-1">
            <Card className="rounded-2xl shadow-sm sticky top-8">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-base font-semibold">Apply for Leave</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reason</Label>
                    <Input required value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 bg-background" placeholder="Medical, Family event…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Date</Label>
                    <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">End Date</Label>
                    <Input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 bg-background" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full h-10 font-semibold mt-2">
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leave list */}
        <div className={user?.role === 'STUDENT' ? 'md:col-span-2' : 'md:col-span-3'}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {user?.role === 'STUDENT' ? 'Your Requests' : 'Pending Requests'}
            </h2>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{leaves.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-14 bg-card rounded-2xl border border-dashed border-border">
              <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-semibold text-sm">No leave records yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => {
                const s = STATUS_STYLES[leave.status] ?? STATUS_STYLES.PENDING;
                const StatusIcon = s.icon;
                return (
                  <Card key={leave.id} className="rounded-2xl shadow-sm overflow-hidden">
                    <div className={cn('h-1 w-full', s.bar)} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {user?.role !== 'STUDENT' && (
                            <div className="flex items-center gap-2 mb-2">
                              <AvatarInitials name={`${leave.student?.firstName} ${leave.student?.lastName}`} size="sm" />
                              <span className="text-sm font-semibold text-foreground">{leave.student?.firstName} {leave.student?.lastName}</span>
                            </div>
                          )}
                          <p className="text-sm font-semibold text-foreground">{leave.reason}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                            <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                            {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={cn('flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full', s.bg, s.text)}>
                            <StatusIcon className="w-3 h-3" /> {leave.status}
                          </span>
                          {user?.role !== 'STUDENT' && leave.status === 'PENDING' && (
                            <div className="flex gap-1.5">
                              <Button size="sm" onClick={() => handleStatusUpdate(leave.id, 'APPROVED')} className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
                              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(leave.id, 'REJECTED')} className="h-7 px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50">Reject</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
