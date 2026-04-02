'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  firstName: string;
  lastName: string;
  departmentId?: string;
  batchYear?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
});

// -- DEV BYPASS ----------------------------------------------
// Set to true to preview the dashboard without Supabase configured.
// Set back to false for normal use.
const DEV_BYPASS = false;
const MOCK_USER: User = {
  id: 'dev-1',
  email: 'student@college.edu',
  role: 'STUDENT',
  firstName: 'Kiki',
  lastName: 'Dev',
  departmentId: 'CS',
  batchYear: 2024,
};
// ------------------------------------------------------------

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEV_BYPASS ? MOCK_USER : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!DEV_BYPASS);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (DEV_BYPASS) return;

    // Load initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (!error && data) {
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        departmentId: data.departmentId,
        batchYear: data.batchYear,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!email.toLowerCase().endsWith('@jainuniversity.ac.in')) {
      throw new Error('Only @jainuniversity.ac.in email addresses are allowed.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName }
      }
    });
    if (error) throw error;

    if (data.user) {
      const { error: dbError } = await supabase.from('User').insert({
        id: data.user.id,
        email: data.user.email,
        firstName,
        lastName,
        role: 'STUDENT',
      });
      if (dbError) throw dbError;
    }

    router.push('/dashboard');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
