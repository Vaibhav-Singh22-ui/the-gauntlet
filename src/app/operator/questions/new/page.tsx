'use client';

import React, { useState } from 'react';
import OperatorNav from '@/components/OperatorNav';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { WheelColor, QuestionDifficulty, VerificationStatus, AnswerOption } from '@/types/game';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewQuestionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    external_id: `Q${Math.floor(1000 + Math.random() * 9000)}`,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as AnswerOption,
    hint_text: '',
    level: 1,
    color: 'RED' as WheelColor,
    category: 'Aptitude',
    difficulty: 'HARD' as QuestionDifficulty,
    expected_solve_seconds: 45,
    verification_status: 'VERIFIED' as VerificationStatus,
    active: true,
    source_type: 'MANUAL_OPERATOR',
    source_reference: 'Operator stall creation',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_text.trim() || !form.option_a.trim() || !form.hint_text.trim()) {
      alert('Please fill in all required question fields and options.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('questions').insert([form]);
      if (error) throw error;
      router.push('/operator/questions');
    } catch (err: any) {
      console.error('Error inserting question:', err);
      alert(err.message || 'Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <OperatorNav />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
              Create New Question
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Add an individual verified question directly to the database.
            </p>
          </div>

          <Link
            href="/operator/questions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] border border-slate-700 text-slate-300 text-xs hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#11131e] border border-[#22273d] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">External ID</label>
              <input
                type="text"
                value={form.external_id}
                onChange={(e) => setForm({ ...form, external_id: e.target.value })}
                required
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Level (1-15)</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Color Pool</label>
              <select
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value as WheelColor })}
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {['RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'VIOLET'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Question Text</label>
            <textarea
              rows={3}
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              required
              placeholder="Enter question statement..."
              className="w-full bg-[#161928] border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Option A</label>
              <input
                type="text"
                value={form.option_a}
                onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                required
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Option B</label>
              <input
                type="text"
                value={form.option_b}
                onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                required
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Option C</label>
              <input
                type="text"
                value={form.option_c}
                onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                required
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Option D</label>
              <input
                type="text"
                value={form.option_d}
                onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                required
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-emerald-400 mb-1">Correct Answer</label>
              <select
                value={form.correct_option}
                onChange={(e) => setForm({ ...form, correct_option: e.target.value as AnswerOption })}
                className="w-full bg-[#161928] border border-emerald-500 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as QuestionDifficulty })}
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="HARD">Hard</option>
                <option value="MEDIUM">Medium</option>
                {form.level <= 5 && <option value="EASY">Easy</option>}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Hint Text</label>
            <input
              type="text"
              value={form.hint_text}
              onChange={(e) => setForm({ ...form, hint_text: e.target.value })}
              required
              placeholder="Directional clue (does not reveal answer)..."
              className="w-full bg-[#161928] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Question'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
