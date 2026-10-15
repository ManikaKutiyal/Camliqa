"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAdminStore((state) => state.login);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, try standard Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError) {
        // Read own profile — now works with the simple RLS policy (id = auth.uid())
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', authData.user.id)
          .single();

        if (!profileError && profile?.role === 'admin') {
          // Success via Supabase Auth!
          login(true, { email: profile.email, role: 'admin', name: profile.full_name });
          router.push('/admin/dashboard');
          return;
        }
      }

      // If Supabase Auth fails or is not admin, check static admin bypass
      const staticPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      if (
        staticPassword &&
        password === staticPassword &&
        email.toLowerCase() === 'admin@camliqa.com'
      ) {
        // Sign into Supabase in the background to ensure session cookies are active!
        try {
          const { error: bgAuthErr } = await supabase.auth.signInWithPassword({
            email: 'admin@camliqa.com',
            password: staticPassword,
          });
          if (bgAuthErr) {
             setError("Database session failed. Check Supabase credentials.");
             setLoading(false);
             return;
          }
        } catch (authErr) {
          console.error("Background auth sign-in failed", authErr);
          setError("Network error connecting to database.");
          setLoading(false);
          return;
        }

        login(true, { email: 'admin@camliqa.com', role: 'admin', name: 'System Administrator' });
        router.push('/admin/dashboard');
        return;
      }

      setError('Invalid email or password.');
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] selection:bg-secondary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 p-4"
      >
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[32px] p-10">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary mb-6"
            >
              <ShieldCheck size={32} strokeWidth={1.5} />
            </motion.div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary mb-3">System Access</p>
            <h1 className="font-serif text-3xl text-primary tracking-tight">Admin Portal</h1>
            <p className="mt-3 text-sm text-primary/50 leading-relaxed">
              Enter your admin credentials to access the Camliqa management suite.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/30 group-focus-within:text-primary/60 transition-colors">
                  <Mail size={18} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  className="w-full bg-white/50 border border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder:text-primary/20"
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/30 group-focus-within:text-primary/60 transition-colors">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Security Password"
                  className="w-full bg-white/50 border border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder:text-primary/20"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-500 bg-red-50/50 p-3 rounded-xl border border-red-100"
                >
                  <AlertCircle size={14} />
                  <p className="text-xs font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-primary text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-primary/95 transition-all shadow-xl shadow-primary/10 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Authorize Access
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-primary/5 text-center">
            <p className="text-[9px] text-primary/30 uppercase tracking-[0.3em] font-medium">
              &copy; 2026 Camliqa Clinical Division &bull; Encrypted Connection
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
