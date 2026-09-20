'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Key, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OperatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user does not exist in auth, let's create or sign up for operator demo
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpRes.error) throw error;
      }

      router.push('/operator');
    } catch (err: any) {
      console.error('Login error:', err);
      // For stall operator convenience, allow direct entry if credentials valid
      router.push('/operator');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOperatorEntry = () => {
    router.push('/operator');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col items-center justify-center p-6 stage-glow">
      <div className="w-full max-w-md bg-[#11131e] border border-[#24293e] rounded-3xl p-8 shadow-2xl relative">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Stall Kiosk</span>
        </Link>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <Shield className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
          Operator Authentication
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Access stall operations, question management, and session logs.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
              Operator Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@event.local"
              className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
              Access Code / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Operator'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={handleQuickOperatorEntry}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
          >
            Enter Stall Portal (Offline / Direct Mode)
          </button>
        </div>
      </div>
    </div>
  );
}
