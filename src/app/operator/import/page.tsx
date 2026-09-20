'use client';

import React, { useState } from 'react';
import OperatorNav from '@/components/OperatorNav';
import { supabase } from '@/lib/supabase';
import { FileUp, CheckCircle, AlertTriangle, Play, Database, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OperatorImportPage() {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dryRunReport, setDryRunReport] = useState<any | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
      setDryRunReport(null);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string): any[] => {
    if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
      return JSON.parse(content);
    }
    // Simple CSV parser
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to parse comma-separated values respecting quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const item: any = {};
      headers.forEach((h, idx) => {
        let val = values[idx] ? values[idx].trim() : '';
        val = val.replace(/^"|"$/g, '').replace(/""/g, '"');
        item[h] = val;
      });
      rows.push(item);
    }
    return rows;
  };

  const handleRunDryRun = async () => {
    if (!fileContent.trim()) {
      alert('Please upload a file or paste JSON/CSV content first.');
      return;
    }

    setAnalyzing(true);
    setDryRunReport(null);

    try {
      const items = parseContent(fileContent);
      const { data, error } = await supabase.rpc('fn_import_questions', {
        p_questions: items,
        p_dry_run: true,
      });

      if (error) throw error;
      setDryRunReport(data);
    } catch (err: any) {
      console.error('Dry run failed:', err);
      alert('Dry Run failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!fileContent.trim()) return;
    setImporting(true);
    setImportResult(null);

    try {
      const items = parseContent(fileContent);
      const { data, error } = await supabase.rpc('fn_import_questions', {
        p_questions: items,
        p_dry_run: false,
      });

      if (error) throw error;
      setImportResult(data);
    } catch (err: any) {
      console.error('Import failed:', err);
      alert('Import execution failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      <OperatorNav />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
            Future Question Bank Importer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Safely import future question banks (e.g. 2,000, 3,000 series) with zero code modifications.
            All new questions are imported with <code className="text-amber-300">NEEDS_HUMAN_REVIEW</code> and <code className="text-amber-300">active = false</code>.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-[#11131e] border border-[#22273d] rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Select Question Bank File (.json or .csv)
              </span>
              <span className="text-[11px] text-slate-500">
                Supports questions_master_2000.csv, JSON arrays, and standard schema.
              </span>
            </div>

            <label className="px-4 py-2 rounded-xl bg-[#181b2e] hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 cursor-pointer flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              <span>{fileName ? 'Choose Another' : 'Browse File'}</span>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {fileName && (
            <div className="text-xs text-emerald-400 mb-3 flex items-center gap-1.5 font-mono">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Loaded: {fileName} ({fileContent.length} bytes)</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
              Raw File Content / Paste Box
            </label>
            <textarea
              rows={6}
              value={fileContent}
              onChange={(e) => {
                setFileContent(e.target.value);
                setDryRunReport(null);
                setImportResult(null);
              }}
              placeholder="Paste JSON array or CSV text here, or select a file above..."
              className="w-full bg-[#161928] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
            />
          </div>

          <div className="mt-5 flex items-center gap-3 justify-end">
            <button
              onClick={handleRunDryRun}
              disabled={analyzing || !fileContent.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#161928] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{analyzing ? 'Validating...' : 'Run Dry Run'}</span>
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={importing || !fileContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{importing ? 'Importing...' : 'Live Import to Database'}</span>
            </button>
          </div>
        </div>

        {/* Dry Run Report Box */}
        {dryRunReport && (
          <div className="bg-[#11131e] border border-amber-500/50 rounded-2xl p-6 shadow-xl mb-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-lg mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3>Dry Run Validation Report</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Rows</span>
                <div className="text-xl font-black text-white">{dryRunReport.total_rows}</div>
              </div>
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Valid</span>
                <div className="text-xl font-black text-emerald-400">{dryRunReport.valid}</div>
              </div>
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-red-400">Invalid</span>
                <div className="text-xl font-black text-red-400">{dryRunReport.invalid}</div>
              </div>
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-yellow-400">Existing Dupes</span>
                <div className="text-xl font-black text-yellow-400">{dryRunReport.duplicates}</div>
              </div>
            </div>

            {dryRunReport.errors && dryRunReport.errors.length > 0 && (
              <div className="bg-[#181116] border border-red-900/60 rounded-xl p-4 text-xs text-red-300">
                <span className="font-bold block mb-2">Errors Detected:</span>
                <ul className="list-disc pl-5 space-y-1">
                  {dryRunReport.errors.slice(0, 10).map((err: any, idx: number) => (
                    <li key={idx}>Row {err.row} ({err.id}): {err.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Live Import Result Box */}
        {importResult && (
          <div className="bg-[#11131e] border border-emerald-500/50 rounded-2xl p-6 shadow-xl mb-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-lg mb-3">
              <CheckCircle className="w-5 h-5" />
              <h3>Import Succeeded!</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Rows</span>
                <div className="text-xl font-black text-white">{importResult.total_rows}</div>
              </div>
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Inserted</span>
                <div className="text-xl font-black text-emerald-400">{importResult.inserted}</div>
              </div>
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400">Updated</span>
                <div className="text-xl font-black text-amber-400">{importResult.updated}</div>
              </div>
              <div className="bg-[#161928] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                <div className="text-sm font-bold text-slate-300 mt-1">Review Needed</div>
              </div>
            </div>

            <Link
              href="/operator/questions"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-2"
            >
              <span>View imported questions in Question Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
