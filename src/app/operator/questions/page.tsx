'use client';

import React, { useState, useEffect, useCallback } from 'react';
import OperatorNav from '@/components/OperatorNav';
import { supabase } from '@/lib/supabase';
import { QuestionRecord, WheelColor, QuestionDifficulty, VerificationStatus, WHEEL_COLORS_CONFIG } from '@/types/game';
import { Search, Filter, CheckCircle, XCircle, Edit, Plus, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function OperatorQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedActive, setSelectedActive] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const pageSize = 20;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' });

      if (search.trim()) {
        query = query.or(`question_text.ilike.%${search.trim()}%,external_id.ilike.%${search.trim()}%`);
      }
      if (selectedLevel !== 'ALL') {
        query = query.eq('level', parseInt(selectedLevel));
      }
      if (selectedColor !== 'ALL') {
        query = query.eq('color', selectedColor);
      }
      if (selectedDifficulty !== 'ALL') {
        query = query.eq('difficulty', selectedDifficulty);
      }
      if (selectedStatus !== 'ALL') {
        query = query.eq('verification_status', selectedStatus);
      }
      if (selectedActive !== 'ALL') {
        query = query.eq('active', selectedActive === 'ACTIVE');
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('external_id', { ascending: true })
        .range(from, to);

      if (error) throw error;
      setQuestions((data as QuestionRecord[]) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedLevel, selectedColor, selectedDifficulty, selectedStatus, selectedActive, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleVerifyToggle = async (questionId: string, currentStatus: VerificationStatus, currentActive: boolean) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'NEEDS_HUMAN_REVIEW' : 'VERIFIED';
    const nextActive = nextStatus === 'VERIFIED';

    try {
      const { error } = await supabase.rpc('fn_verify_question', {
        p_question_id: questionId,
        p_status: nextStatus,
        p_active: nextActive,
      });
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Error updating question verification:', err);
      alert('Failed to update question status');
    }
  };

  const handleActiveToggle = async (questionId: string, currentActive: boolean, currentStatus: VerificationStatus) => {
    try {
      const { error } = await supabase.rpc('fn_verify_question', {
        p_question_id: questionId,
        p_status: currentStatus,
        p_active: !currentActive,
      });
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Error updating active state:', err);
      alert('Failed to toggle active state');
    }
  };

  const handleBulkVerifyAndActivate = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      const { error } = await supabase.rpc('fn_batch_verify_questions', {
        p_question_ids: ids,
        p_status: 'VERIFIED',
        p_active: true,
      });
      if (error) throw error;
      setSelectedIds(new Set());
      fetchQuestions();
    } catch (err) {
      console.error('Error in bulk verification:', err);
      alert('Bulk verification failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <OperatorNav />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
              Question Bank Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Showing {totalCount} matching questions in the system.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkVerifyAndActivate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Activate ({selectedIds.size})</span>
              </button>
            )}

            <Link
              href="/operator/questions/new"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#11131e] border border-[#22273d] rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3 shadow-md">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by text or Q ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#161928] border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setPage(1);
            }}
            className="bg-[#161928] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Levels (1-15)</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (
              <option key={lvl} value={lvl}>
                Level {lvl}
              </option>
            ))}
          </select>

          {/* Color Filter */}
          <select
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              setPage(1);
            }}
            className="bg-[#161928] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Colors</option>
            {['RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'VIOLET'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="bg-[#161928] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="VERY_VERY_EASY">Very Very Easy (L1)</option>
            <option value="VERY_EASY">Very Easy (L2)</option>
            <option value="EASY">Easy (L3)</option>
            <option value="MEDIUM">Medium (L4-15)</option>
            <option value="HARD">Hard (L4-15)</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#161928] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEEDS_HUMAN_REVIEW">Needs Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Active Filter */}
          <select
            value={selectedActive}
            onChange={(e) => {
              setSelectedActive(e.target.value);
              setPage(1);
            }}
            className="bg-[#161928] border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">Active & Inactive</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        {/* Questions Table */}
        <div className="bg-[#11131e] border border-[#22273d] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161928] text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={questions.length > 0 && selectedIds.size === questions.length}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 w-20">ID</th>
                  <th className="p-3.5 w-16">Level</th>
                  <th className="p-3.5 w-20">Color</th>
                  <th className="p-3.5 min-w-[280px]">Question & Answer Key</th>
                  <th className="p-3.5 w-24">Difficulty</th>
                  <th className="p-3.5 w-32">Status</th>
                  <th className="p-3.5 w-20 text-center">Active</th>
                  <th className="p-3.5 w-16 text-center">Used</th>
                  <th className="p-3.5 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1f33] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      Loading questions...
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      No questions match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => {
                    const colorConfig = WHEEL_COLORS_CONFIG[q.color];
                    const isSelected = selectedIds.has(q.id);

                    return (
                      <tr
                        key={q.id}
                        className={`hover:bg-[#161928]/60 transition-colors ${
                          isSelected ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(q.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 font-mono font-bold text-amber-300">
                          {q.external_id}
                        </td>
                        <td className="p-3.5 font-bold text-slate-300">L{q.level}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${colorConfig.borderClass} ${colorConfig.textClass} bg-slate-900`}
                          >
                            {colorConfig.name}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200 line-clamp-2">
                            {q.question_text}
                          </div>
                          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                            Key: Option {q.correct_option} • Hint: {q.hint_text}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              q.difficulty === 'HARD'
                                ? 'bg-red-950/70 text-red-300 border border-red-800'
                                : q.difficulty === 'MEDIUM'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                                : q.difficulty === 'VERY_VERY_EASY'
                                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800'
                                : q.difficulty === 'VERY_EASY'
                                ? 'bg-sky-950/70 text-sky-300 border border-sky-800'
                                : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {q.difficulty.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleVerifyToggle(q.id, q.verification_status, q.active)}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              q.verification_status === 'VERIFIED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                                : q.verification_status === 'REJECTED'
                                ? 'bg-red-950 text-red-300 border border-red-700'
                                : 'bg-slate-800 text-amber-300 border border-amber-800/80 hover:bg-slate-700'
                            }`}
                            title="Click to toggle Verified / Review"
                          >
                            {q.verification_status === 'VERIFIED'
                              ? '✓ VERIFIED'
                              : q.verification_status === 'REJECTED'
                              ? '✗ REJECTED'
                              : '⏳ REVIEW'}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleActiveToggle(q.id, q.active, q.verification_status)}
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all cursor-pointer ${
                              q.active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                            title={q.active ? 'Active in game pool' : 'Inactive'}
                          >
                            {q.active ? '●' : '○'}
                          </button>
                        </td>
                        <td className="p-3.5 text-center text-slate-400 font-mono">
                          {q.times_used}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/operator/questions/${q.id}`}
                            className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                            title="Edit Question"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page {page} of {Math.max(1, totalPages)} ({totalCount} total items)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-[#161928] border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#161928] border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
