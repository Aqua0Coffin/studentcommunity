'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api';
import { BookOpen, Plus, Search, Book } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SubjectsManagerPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // New Subject form state
  const [newSubject, setNewSubject] = useState({ name: '', courseCode: '', departmentId: '' });
  const [creating, setCreating] = useState(false);

  // Mass Enrollment form state
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('User').select('id, firstName, lastName, email').eq('role', 'STUDENT');
    if (data) setStudents(data);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('Subject').select('*').order('createdAt', { ascending: false });
    if (error) {
      toast.error('Failed to fetch subjects');
    } else {
      setSubjects(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.courseCode) return;
    
    setCreating(true);
    try {
      const { error } = await supabase.from('Subject').insert([{
        name: newSubject.name,
        courseCode: newSubject.courseCode,
        departmentId: newSubject.departmentId || null
      }]);

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error(`Failed to create subject: ${error.message}`);
      } else {
        toast.success('Subject created successfully!');
        setNewSubject({ name: '', courseCode: '', departmentId: '' });
        fetchSubjects();
      }
    } catch (err: any) {
      console.error("Unexpected exception:", err);
      toast.error(`Unexpected error: ${err.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || selectedStudentIds.length === 0) return;
    setEnrolling(true);
    try {
      const records = selectedStudentIds.map(stId => ({
        studentId: stId,
        subjectId: selectedSubjectId
      }));
      const { error } = await supabase.from('Enrollment').upsert(records);
      if (error) throw error;
      toast.success(`Successfully enrolled ${selectedStudentIds.length} student(s)!`);
      setSelectedStudentIds([]);
      setSelectedSubjectId('');
    } catch (err: any) {
      toast.error(`Failed to enroll: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.id));
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.courseCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Subject Manager</h1>
        <p className="text-white/50 mt-1">Manage active courses and branches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                  placeholder="Search subjects..." 
                  className="pl-10 bg-black/20 border-emerald-900/40 text-white placeholder-white/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-white/40">Loading subjects...</div>
            ) : filteredSubjects.length === 0 ? (
              <div className="py-10 text-center text-white/40 flex flex-col items-center gap-2">
                <Book className="w-8 h-8 opacity-50" />
                No subjects found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubjects.map(subject => (
                  <div key={subject.id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white/40 bg-black/30 px-2 py-1 rounded-md">{subject.courseCode}</span>
                    </div>
                    <h3 className="font-bold text-white mt-2">{subject.name}</h3>
                    {subject.departmentId && <p className="text-xs text-white/50 mt-1">Dept: {subject.departmentId}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
            <h2 className="text-xl font-bold text-white mb-4">Create New Subject</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">Course Name</label>
                <Input 
                  required
                  placeholder="e.g. Data Structures" 
                  className="bg-black/20 border-emerald-900/40 text-white"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">Course Code</label>
                <Input 
                  required
                  placeholder="e.g. CS201" 
                  className="bg-black/20 border-emerald-900/40 text-white"
                  value={newSubject.courseCode}
                  onChange={(e) => setNewSubject({...newSubject, courseCode: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">Department (Optional)</label>
                <Input 
                  placeholder="e.g. Computer Science" 
                  className="bg-black/20 border-emerald-900/40 text-white"
                  value={newSubject.departmentId}
                  onChange={(e) => setNewSubject({...newSubject, departmentId: e.target.value})}
                />
              </div>
              <Button 
                type="submit" 
                disabled={creating}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 mt-2"
              >
                {creating ? 'Creating...' : <><Plus className="w-4 h-4 mr-2" /> Create Subject</>}
              </Button>
            </form>
          </div>

          {/* Mass Enrollment Form */}
          <div className="glass-panel rounded-[1.5rem] p-6 border-indigo-900/30 mt-6 flex flex-col h-[450px]">
            <h2 className="text-xl font-bold text-white mb-4">Mass Enrollment</h2>
            <form onSubmit={handleEnroll} className="flex flex-col flex-1 min-h-0 space-y-4">
              <div className="shrink-0">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">1. Select Subject</label>
                <select 
                  required
                  className="w-full h-10 px-3 bg-black/20 border border-indigo-900/40 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-sm"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(su => (
                    <option key={su.id} value={su.id}>{su.name} ({su.courseCode})</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-1 shrink-0">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">2. Select Students</label>
                  <button 
                    type="button" 
                    onClick={toggleAllStudents}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-black/20 border border-indigo-900/40 rounded-md p-2 space-y-1 custom-scrollbar">
                  {students.map(st => (
                    <label key={st.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-indigo-900/50 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={() => toggleStudent(st.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{st.firstName} {st.lastName}</span>
                        <span className="text-[10px] text-white/40">{st.email}</span>
                      </div>
                    </label>
                  ))}
                  {students.length === 0 && <div className="text-center text-xs text-white/40 py-4">No students found.</div>}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={enrolling || !selectedSubjectId || selectedStudentIds.length === 0}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:bg-indigo-500 text-white font-bold h-10 mt-auto shrink-0"
              >
                {enrolling ? 'Enrolling...' : `Enroll ${selectedStudentIds.length} Student(s)`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
