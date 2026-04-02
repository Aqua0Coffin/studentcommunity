'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      toast.success('Login successful!');
      login(response.data.token, response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-[1.75rem] glass-panel !border-white/30 dark:!border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <CardHeader className="space-y-1 text-center pb-6 pt-8 relative z-10">
          <CardTitle className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300 font-medium pt-2">Sign in to your student community portal</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-700 dark:text-slate-200">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="student@college.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/50 dark:border-white/10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:text-white placeholder:text-slate-400/80 transition-all rounded-xl shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-slate-700 dark:text-slate-200">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/50 dark:border-white/10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:text-white placeholder:text-slate-400/80 transition-all rounded-xl shadow-inner"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-md font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all rounded-xl mt-6 border border-white/20" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm font-medium text-slate-600 dark:text-slate-400 pb-8 relative z-10">
          Need an account? Contact your department admin.
        </CardFooter>
      </Card>
    </div>
  );
}
