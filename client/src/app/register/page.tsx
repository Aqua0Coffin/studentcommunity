'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Frontend validation for email domain
    if (!email.toLowerCase().endsWith('@jainuniversity.ac.in')) {
      toast.error('Only @jainuniversity.ac.in email addresses are allowed.');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, firstName, lastName);
      toast.success('Registration successful! Welcome.');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to register';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-white/30 backdrop-blur-md bg-white/70 dark:bg-slate-800/70 relative overflow-hidden rounded-2xl">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Join the Community
          </CardTitle>
          <CardDescription className="dark:text-slate-300 font-medium pt-2">
            Create your student account to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="font-bold text-slate-700 dark:text-slate-200"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/50 dark:border-white/10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="font-bold text-slate-700 dark:text-slate-200"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/50 dark:border-white/10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-bold text-slate-700 dark:text-slate-200"
              >
                University Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@jainuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/50 dark:border-white/10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-bold text-slate-700 dark:text-slate-200"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/50 dark:border-white/10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-md font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all rounded-xl mt-6 border border-white/20"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm font-medium text-slate-600 dark:text-slate-400 pb-8 relative z-10">
          <p>
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition-all"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
