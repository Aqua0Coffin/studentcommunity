'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = () => {
    setLoading(true);
    api.get('/leaves')
      .then(({data}) => setLeaves(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
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
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Leaves & Attendance</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your leave requests and attendance.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {user?.role === 'STUDENT' && (
          <div className="md:col-span-1">
            <Card className="rounded-2xl border-slate-200 shadow-sm sticky top-8">
              <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
                <CardTitle className="text-xl font-bold">Apply for Leave</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleApply} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Reason</Label>
                    <Input required value={reason} onChange={e => setReason(e.target.value)} className="h-12 bg-slate-50 border-slate-200 placeholder:text-slate-400 font-medium" placeholder="Medical, Family Event..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Start Date</Label>
                    <Input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-12 bg-slate-50 border-slate-200 font-medium text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">End Date</Label>
                    <Input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-12 bg-slate-50 border-slate-200 font-medium text-slate-700" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full text-md font-bold h-12 bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-sm">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className={user?.role === 'STUDENT' ? 'md:col-span-2' : 'md:col-span-3'}>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6 flex items-center gap-3">
            {user?.role === 'STUDENT' ? 'Your Leave History' : 'Pending Leave Requests'}
            <span className="bg-slate-100 text-slate-600 text-sm py-1 px-3 rounded-full">{leaves.length}</span>
          </h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-bold text-lg">No leave records found.</p>
                <p className="text-slate-400 mt-1">You haven't submitted any leave requests yet.</p>
              </div>
            ) : (
              leaves.map(leave => (
                <Card key={leave.id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow transition-all group overflow-hidden">
                  <div className={`h-1.5 w-full ${
                          leave.status === 'APPROVED' ? 'bg-green-500' :
                          leave.status === 'REJECTED' ? 'bg-red-500' :
                          'bg-amber-400'
                        }`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        {user?.role !== 'STUDENT' && (
                          <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                            {leave.student.firstName} {leave.student.lastName}
                          </h3>
                        )}
                        <p className="text-slate-800 font-semibold text-[17px] leading-snug">{leave.reason}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <p className="text-sm text-slate-700 font-bold bg-slate-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wider ${
                          leave.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {leave.status}
                        </span>
                        
                        {user?.role !== 'STUDENT' && leave.status === 'PENDING' && (
                          <div className="mt-5 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" onClick={() => handleStatusUpdate(leave.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm">Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(leave.id, 'REJECTED')} className="font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm">Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
