'use client';

import React, { useEffect, useState } from 'react';
import OperatorNav from '@/components/OperatorNav';
import { supabase } from '@/lib/supabase';
import { GameSession } from '@/types/game';
import { RefreshCw, Trophy, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function OperatorSessionsPage() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions((data as GameSession[]) || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <OperatorNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
              Event Gameplay Sessions
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit log of player attempts, level progression, and final outcomes.
            </p>
          </div>

          <button
            onClick={fetchSessions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] border border-slate-700 text-amber-400 text-xs font-bold hover:border-amber-400 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-[#11131e] border border-[#22273d] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161928] text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <th className="p-3.5">Session ID</th>
                  <th className="p-3.5">Started At</th>
                  <th className="p-3.5">Final Level</th>
                  <th className="p-3.5">Reward Paid</th>
                  <th className="p-3.5">Outcome</th>
                  <th className="p-3.5">Lifelines Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1f33] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Loading session history...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No game sessions recorded yet. Start a game at the stall kiosk!
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#161928]/50">
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {s.id.substring(0, 8)}...
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-bold font-display text-white">
                        Level {s.final_level || s.current_level}
                      </td>
                      <td className="p-3.5 font-bold font-display text-amber-400">
                        {s.final_reward || s.current_reward} PTS
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            s.result === 'WON'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : s.result === 'LOST_TIMEOUT'
                              ? 'bg-orange-950 text-orange-300 border border-orange-800'
                              : s.result === 'LOST_WRONG'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.result || s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        Hint: {s.lifeline_hint_available ? '✓' : '✗'} • 50:50: {s.lifeline_fifty_fifty_available ? '✓' : '✗'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
