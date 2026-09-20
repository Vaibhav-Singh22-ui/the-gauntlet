'use client';

import React, { useEffect, useState } from 'react';
import OperatorNav from '@/components/OperatorNav';
import { supabase } from '@/lib/supabase';
import { Database, CheckCircle2, Trophy, DollarSign, Users, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  total_questions: number;
  verified_questions: number;
  active_questions: number;
  total_sessions: number;
  completed_sessions: number;
  lost_sessions: number;
  total_rewards_paid: number;
  total_entry_fees: number;
}

export default function OperatorOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_operator_get_stats');
      if (error) throw error;
      setStats(data as Stats);
    } catch (err) {
      console.error('Error fetching operator stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const netBalance = (stats?.total_entry_fees || 0) - (stats?.total_rewards_paid || 0);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <OperatorNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
              Event Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live stall statistics, question verification pool health, and financial ledger.
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#141624] border border-[#24293e] hover:border-amber-400 text-xs font-bold text-amber-400 transition-all cursor-pointer"
          >
            Refresh Data
          </button>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Sessions */}
          <div className="bg-[#11131e] border border-[#22273d] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Games Played</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black font-display text-white">
              {loading ? '...' : stats?.total_sessions || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {stats?.completed_sessions || 0} Won • {stats?.lost_sessions || 0} Lost
            </div>
          </div>

          {/* Card 2: Entry Fees Collected */}
          <div className="bg-[#11131e] border border-[#22273d] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Entry Fees (₹50)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-display text-emerald-400">
              ₹{loading ? '...' : stats?.total_entry_fees || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Manual Cash / UPI Collection
            </div>
          </div>

          {/* Card 3: Rewards Paid Out */}
          <div className="bg-[#11131e] border border-[#22273d] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Rewards Disbursed</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-display text-amber-400">
              ₹{loading ? '...' : stats?.total_rewards_paid || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Net Stall Profit: <span className={netBalance >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>₹{netBalance}</span>
            </div>
          </div>

          {/* Card 4: Question Pool Health */}
          <div className="bg-[#11131e] border border-[#22273d] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Active Verified Qs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-display text-emerald-400">
              {loading ? '...' : stats?.active_questions || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Of {stats?.total_questions || 1000} Total In Database
            </div>
          </div>
        </div>

        {/* Quick Management Links */}
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-slate-300 mb-4">
          Quick Management
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/operator/questions"
            className="bg-[#11131e] hover:bg-[#161928] border border-[#22273d] hover:border-amber-500/60 p-5 rounded-2xl transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                Question Bank Manager
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Inspect 1,000 questions, filter by level and color, review unverified items, and activate for live events.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-400 gap-1">
              <span>Manage Questions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/operator/import"
            className="bg-[#11131e] hover:bg-[#161928] border border-[#22273d] hover:border-sky-500/60 p-5 rounded-2xl transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-sky-400 transition-colors">
                Import Future Banks
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload future CSV or JSON question banks (e.g. 2,000/3,000 series) with interactive dry-run validation.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-sky-400 gap-1">
              <span>Open Importer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/operator/sessions"
            className="bg-[#11131e] hover:bg-[#161928] border border-[#22273d] hover:border-emerald-500/60 p-5 rounded-2xl transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                Event Session History
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Audit every player run, levels reached, answer decisions, lifelines consumed, and rewards won.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-400 gap-1">
              <span>View Sessions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
