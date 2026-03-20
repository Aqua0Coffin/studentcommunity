'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

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
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

// ── DEV BYPASS ──────────────────────────────────────────────
// Set to true to preview the dashboard without the backend running.
// Set back to false for normal use.
const DEV_BYPASS = true;
const MOCK_USER: User = {
  id: 'dev-1',
  email: 'student@college.edu',
  role: 'STUDENT',
  firstName: 'Kiki',
  lastName: 'Dev',
  departmentId: 'CS',
  batchYear: 2024,
};
// ────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEV_BYPASS ? MOCK_USER : null);
  const [loading, setLoading] = useState(!DEV_BYPASS);
  const router = useRouter();

  useEffect(() => {
    if (DEV_BYPASS) return; // skip real auth in bypass mode
    const loadUser = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          // Check expiration
          const decoded: any = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            Cookies.remove('token');
          } else {
            const { data } = await api.get('/users/me');
            setUser(data);
          }
        } catch (error) {
          console.error("Failed to load user", error);
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 1 }); // 1 day
    api.get('/users/me').then(({data}) => setUser(data)).catch(() => setUser(userData));
    router.push('/dashboard');
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
