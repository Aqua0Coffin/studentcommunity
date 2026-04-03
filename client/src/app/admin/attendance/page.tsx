'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Save, CheckCircle, XCircle } from 'lucide-react';
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
    // Fetch students enrolled in this subject
    const { data: enrollments, error } = await supabase
      .from('Enrollment')
      .select(`
        studentId,
        User!inner(id, firstName, lastName)
      `)
      .eq('subjectId', subjectId);
    
    if (error) {
      toast.error('Failed to load roster.');
      setRoster([]);
    } else {
      // Map it to roster format
      const initializedRoster = (enrollments || []).map((en: any) => ({
        studentId: en.studentId,
        student: en.User,
        status: 'PRESENT' // default
      }));
      setRoster(initializedRoster);
    }
    setLoading(false);
  };

  const updateStatus = (studentId: string, status: string) => {
    setRoster(roster.map(r => r.studentId === studentId ? { ...r, status } : r));
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
      markedById: user.id
    }));

    const { error } = await supabase.from('AttendanceSession').upsert(records, {
      onConflict: 'studentId, subjectId, date'
    });

    if (error) {
      console.error(error);
      toast.error('Failed to save attendance. Checking conflicts.');
    } else {
      toast.success('Attendance saved for ' + date);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Mass Logger</h1>
        <p className="text-white/50 mt-1">Record attendance seamlessly for entire batches.</p>
      </div>

      <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block flex items-center gap-2">
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
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-white">Roster</h2>
              <Button 
                onClick={saveAttendance}
                disabled={saving || roster.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
              >
                {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Session</>}
              </Button>
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
                      <th className="pb-3 px-4">Student</th>
                      <th className="pb-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map(r => (
                      <tr key={r.studentId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-white text-sm">{r.student?.firstName} {r.student?.lastName}</p>
                          <p className="text-xs text-white/40">{r.studentId.slice(0, 8)}</p>
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
                              <CheckCircle className="w-3 h-3" /> P
                            </button>
                            <button
                              onClick={() => updateStatus(r.studentId, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                                r.status === 'ABSENT' 
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' 
                                  : 'bg-black/20 text-white/30 border border-white/5 hover:border-rose-500/30 hover:text-rose-400/50'
                              }`}
                            >
                              <XCircle className="w-3 h-3" /> A
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
          <div className="py-20 text-center border-t border-white/5 mt-8">
            <p className="text-white/30 font-medium">Please select a subject to load the roster.</p>
          </div>
        )}
      </div>
    </div>
  );
}
