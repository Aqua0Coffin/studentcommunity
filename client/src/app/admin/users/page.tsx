'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api';
import { Search, ShieldAlert, GraduationCap, ArrowUpRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RoleManagerPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    if (error) {
      toast.error('Failed to fetch users');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const grantRole = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    
    const { error } = await supabase.from('User').update({ role: newRole }).eq('id', userId);
    
    if (error) {
      toast.error('Failed to update role');
    } else {
      toast.success(`Successfully granted ${newRole} privileges!`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Role Manager</h1>
        <p className="text-white/50 mt-1">Search the database and manage system access levels.</p>
      </div>

      <div className="glass-panel rounded-[1.5rem] p-6 border-emerald-900/30">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10 h-10 bg-black/20 border-emerald-900/40 focus-visible:ring-emerald-500 text-white placeholder-white/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-white/40 text-sm">Loading database records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <th className="pb-3 px-4">User</th>
                  <th className="pb-3 px-4">Joined At</th>
                  <th className="pb-3 px-4">Current Role</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-white/50">{user.email}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-white/70">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {user.role === 'ADMIN' && <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldAlert className="w-3 h-3"/> ADMIN</span>}
                      {user.role === 'FACULTY' && <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><BookOpen className="w-3 h-3"/> FACULTY</span>}
                      {user.role === 'STUDENT' && <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><GraduationCap className="w-3 h-3"/> STUDENT</span>}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {user.role !== 'ADMIN' ? (
                        <div className="flex flex-col gap-1 items-end">
                          <button 
                            onClick={() => grantRole(user.id, user.role, 'ADMIN')}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-end gap-1 ml-auto"
                          >
                            Grant Admin <ArrowUpRight className="w-3 h-3" />
                          </button>
                          {user.role !== 'FACULTY' && (
                            <button 
                              onClick={() => grantRole(user.id, user.role, 'FACULTY')}
                              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-end gap-1 ml-auto"
                            >
                              Make Faculty <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-white/20">Access Maximum</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/40 text-sm">No users found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
