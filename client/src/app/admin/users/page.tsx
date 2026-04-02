'use client';

import { useState } from 'react';
import { Search, ShieldAlert, GraduationCap, ArrowUpRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Mocked data for prototyping the users table
const MOCK_USERS = [
  { id: '1', name: 'Alina Davis', email: 'alina.d@jainuniversity.ac.in', role: 'STUDENT', joined: 'Oct 02, 2025' },
  { id: '2', name: 'Rahul Sharma', email: 'rahul.s@jainuniversity.ac.in', role: 'STUDENT', joined: 'Sep 28, 2025' },
  { id: '3', name: 'Dr. Emily Chen', email: 'emily.chen@jainuniversity.ac.in', role: 'FACULTY', joined: 'Dec 10, 2024' },
  { id: '4', name: 'Kushal Patel', email: 'kushal.p@jainuniversity.ac.in', role: 'STUDENT', joined: 'Jan 15, 2026' },
  { id: '5', name: 'System Administrator', email: 'admin@jainuniversity.ac.in', role: 'ADMIN', joined: 'Jan 01, 2024' },
];

export default function RoleManagerPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const grantAdminRole = (userId: string, currentRole: string) => {
    if (currentRole === 'ADMIN') {
      toast.info('User is already an Admin.');
      return;
    }
    
    // Simulate API Call
    setUsers(users.map(u => u.id === userId ? { ...u, role: 'ADMIN' } : u));
    toast.success('Successfully granted ADMIN privileges!');
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
          <Button disabled className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20">
            Export List
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <th className="pb-3 px-4">User</th>
                <th className="pb-3 px-4">Joined</th>
                <th className="pb-3 px-4">Current Role</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-white text-sm">{user.name}</p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-white/70">
                    {user.joined}
                  </td>
                  <td className="py-4 px-4">
                    {user.role === 'ADMIN' && <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldAlert className="w-3 h-3"/> ADMIN</span>}
                    {user.role === 'FACULTY' && <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><BookOpen className="w-3 h-3"/> FACULTY</span>}
                    {user.role === 'STUDENT' && <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><GraduationCap className="w-3 h-3"/> STUDENT</span>}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {user.role !== 'ADMIN' ? (
                      <button 
                        onClick={() => grantAdminRole(user.id, user.role)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-end gap-1 ml-auto"
                      >
                        Grant Admin <ArrowUpRight className="w-3 h-3" />
                      </button>
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
      </div>
    </div>
  );
}
