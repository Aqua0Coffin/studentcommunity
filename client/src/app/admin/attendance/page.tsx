'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Save, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MassLoggerPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) fetchRoster(selectedSubject);
    else setRoster([]);
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data } = await supabase.from('Subject').select('*').order('name');
    if (data) setSubjects(data);
  };

  const fetchRoster = async (subjectId: string) => {
    setLoading(true);
    const { data: enrollments, error } = await supabase
      .from('Enrollment')
      .select(`studentId, User!inner(id, firstName, lastName)`)
      .eq('subjectId', subjectId);

    if (error) {
      toast.error('Failed to load roster.');
      setRoster([]);
    } else {
      const initializedRoster = (enrollments || []).map((en: any) => ({
        studentId: en.studentId,
        student: en.User,
        status: 'PRESENT',
      }));
      setRoster(initializedRoster);
    }
    setLoading(false);
  };

  const updateStatus = (studentId: string, status: string) => {
    setRoster(roster.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    setRoster(roster.map(r => ({ ...r, status })));
  };

  const saveAttendance = async () => {
    if (!selectedSubject || !date || roster.length === 0) return;
    if (!user) return toast.error('You must be logged in');

    setSaving(true);
    const records = roster.map(r => ({
      studentId: r.studentId,
      subjectId: selectedSubject,
      date,
      status: r.status,
      markedById: user.id,
    }));

    const { error } = await supabase.from('AttendanceSession').upsert(records, {
      onConflict: 'studentId, subjectId, date',
    });

    if (error) {
      console.error(error);
      toast.error('Failed to save attendance.');
    } else {
      toast.success(`Attendance saved for ${date}`);
    }
    setSaving(false);
  };

  const presentCount = roster.filter(r => r.status === 'PRESENT').length;
  const absentCount = roster.filter(r => r.status === 'ABSENT').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Mass Logger</h1>
        <p className="text-white/50 mt-1">Record attendance seamlessly for entire batches.</p>
      </div>

      <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Subject</label>
            <select
              className="w-full h-10 px-3 bg-black/20 border border-emerald-900/40 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.courseCode})</option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Date
            </label>
            <input
              type="date"
              className="w-full h-10 px-3 bg-black/20 border border-emerald-900/40 rounded-md text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {selectedSubject ? (
          <div>
            {/* Roster header with live counts + bulk actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white">Roster</h2>
                {roster.length > 0 && (
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> {presentCount} Present
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <XCircle className="w-3.5 h-3.5" /> {absentCount} Absent
                    </span>
                    <span className="text-white/30 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {roster.length} Total
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {roster.length > 0 && (
                  <>
                    <button
                      onClick={() => markAll('PRESENT')}
                      className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    >
                      All Present
                    </button>
                    <button
                      onClick={() => markAll('ABSENT')}
                      className="px-3 py-1.5 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                    >
                      All Absent
                    </button>
                  </>
                )}
                <Button
                  onClick={saveAttendance}
                  disabled={saving || roster.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
                >
                  {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Session</>}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-white/40">Loading students...</div>
            ) : roster.length === 0 ? (
              <div className="py-10 text-center text-white/40">No students enrolled in this subject.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      <th className="pb-3 px-4">#</th>
                      <th className="pb-3 px-4">Student</th>
                      <th className="pb-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((r, idx) => (
                      <tr key={r.studentId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-xs text-white/30 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                              r.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400' :
                              r.status === 'ABSENT' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white/40'
                            }`}>
                              {r.student?.firstName?.[0]}{r.student?.lastName?.[0]}
                            </div>
                            <p className="font-bold text-white text-sm">{r.student?.firstName} {r.student?.lastName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => updateStatus(r.studentId, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                                r.status === 'PRESENT'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                  : 'bg-black/20 text-white/30 border border-white/5 hover:border-emerald-500/30 hover:text-emerald-400/50'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" /> Present
                            </button>
                            <button
                              onClick={() => updateStatus(r.studentId, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                                r.status === 'ABSENT'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                                  : 'bg-black/20 text-white/30 border border-white/5 hover:border-rose-500/30 hover:text-rose-400/50'
                              }`}
                            >
                              <XCircle className="w-3 h-3" /> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center border-t border-white/5 mt-2">
            <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 font-medium">Select a subject above to load the student roster.</p>
          </div>
        )}
      </div>
    </div>
  );
}
