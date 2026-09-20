/**
 * Reusable Question Bank Importer Pipeline
 * Supports: JSON and CSV files, schema validation, field checks,
 * duplicate detection, level/color/difficulty constraints, and dry-run reporting.
 *
 * Usage:
 *   npx tsx scripts/import_questions.ts --file=questions_master_1000.json [--dry-run]
 *   npx tsx scripts/import_questions.ts --file=questions_master_1000.csv [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

interface RawQuestion {
  id?: string;
  external_id?: string;
  question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: string;
  hint_text?: string;
  level?: number | string;
  color?: string;
  category?: string;
  difficulty?: string;
  expected_solve_seconds?: number | string;
  verification_status?: string;
  active?: boolean | string;
  source_type?: string;
  source_reference?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  cleanData?: {
    external_id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    hint_text: string;
    level: number;
    color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PINK' | 'VIOLET';
    category: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    expected_solve_seconds: number;
    verification_status: 'NEEDS_HUMAN_REVIEW' | 'VERIFIED' | 'REJECTED';
    active: boolean;
    source_type: string;
    source_reference: string;
  };
}

const VALID_COLORS = new Set(['RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'VIOLET']);
const VALID_DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD']);
const VALID_OPTIONS = new Set(['A', 'B', 'C', 'D']);

function validateQuestion(q: RawQuestion, rowIndex: number): ValidationResult {
  const errors: string[] = [];
  const extId = (q.external_id || q.id || '').trim();

  if (!extId) errors.push(`Row ${rowIndex}: Missing ID/external_id`);
  if (!q.question_text?.trim()) errors.push(`Row ${rowIndex} (${extId}): Missing question_text`);
  if (!q.option_a?.trim()) errors.push(`Row ${rowIndex} (${extId}): Missing option_a`);
  if (!q.option_b?.trim()) errors.push(`Row ${rowIndex} (${extId}): Missing option_b`);
  if (!q.option_c?.trim()) errors.push(`Row ${rowIndex} (${extId}): Missing option_c`);
  if (!q.option_d?.trim()) errors.push(`Row ${rowIndex} (${extId}): Missing option_d`);

  const correct = (q.correct_option || '').trim().toUpperCase();
  if (!VALID_OPTIONS.has(correct)) {
    errors.push(`Row ${rowIndex} (${extId}): Invalid correct_option '${correct}' (must be A, B, C, or D)`);
  }

  if (!q.hint_text?.trim()) {
    errors.push(`Row ${rowIndex} (${extId}): Missing hint_text`);
  }

  const level = Number(q.level);
  if (!Number.isInteger(level) || level < 1 || level > 15) {
    errors.push(`Row ${rowIndex} (${extId}): Invalid level '${q.level}' (must be integer 1-15)`);
  }

  const color = (q.color || '').trim().toUpperCase();
  if (!VALID_COLORS.has(color)) {
    errors.push(`Row ${rowIndex} (${extId}): Invalid color '${q.color}'`);
  }

  const difficulty = (q.difficulty || '').trim().toUpperCase();
  if (!VALID_DIFFICULTIES.has(difficulty)) {
    errors.push(`Row ${rowIndex} (${extId}): Invalid difficulty '${q.difficulty}'`);
  }

  // Rule: Levels 6-15 must not have EASY questions
  if (level >= 6 && difficulty === 'EASY') {
    errors.push(`Row ${rowIndex} (${extId}): EASY questions are prohibited for Levels 6-15`);
  }

  let solveSec = Number(q.expected_solve_seconds);
  if (isNaN(solveSec) || solveSec < 1 || solveSec > 60) {
    solveSec = 45; // safe default
  }

  let active = false;
  if (typeof q.active === 'boolean') active = q.active;
  else if (typeof q.active === 'string') active = q.active.toLowerCase() === 'true';

  let verStatus: 'NEEDS_HUMAN_REVIEW' | 'VERIFIED' | 'REJECTED' = 'NEEDS_HUMAN_REVIEW';
  const rawStatus = (q.verification_status || '').trim().toUpperCase();
  if (rawStatus === 'VERIFIED') verStatus = 'VERIFIED';
  else if (rawStatus === 'REJECTED') verStatus = 'REJECTED';

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    cleanData: {
      external_id: extId,
      question_text: q.question_text!.trim(),
      option_a: q.option_a!.trim(),
      option_b: q.option_b!.trim(),
      option_c: q.option_c!.trim(),
      option_d: q.option_d!.trim(),
      correct_option: correct as 'A' | 'B' | 'C' | 'D',
      hint_text: q.hint_text!.trim(),
      level,
      color: color as 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PINK' | 'VIOLET',
      category: (q.category || 'General').trim(),
      difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      expected_solve_seconds: solveSec,
      verification_status: verStatus,
      active,
      source_type: q.source_type?.trim() || 'ORIGINAL_GENERATED',
      source_reference: q.source_reference?.trim() || ''
    }
  };
}

function parseCSV(content: string): RawQuestion[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]);
  const records: RawQuestion[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const item: any = {};
    for (let j = 0; j < header.length; j++) {
      item[header[j].trim()] = values[j] !== undefined ? values[j] : '';
    }
    records.push(item);
  }
  return records;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        result.push(current);
        current = '';
      } else {
        current += c;
      }
    }
  }
  result.push(current);
  return result;
}

export async function runImporter(filePath: string, isDryRun: boolean = false) {
  console.log('====================================================');
  console.log('       ₹50 CHALLENGE — QUESTION BANK IMPORTER       ');
  console.log('====================================================');
  console.log(`Target File : ${filePath}`);
  console.log(`Mode        : ${isDryRun ? 'DRY RUN (Validation only)' : 'LIVE IMPORT'}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');
  let rawItems: RawQuestion[] = [];

  if (filePath.endsWith('.json')) {
    rawItems = JSON.parse(rawContent);
  } else if (filePath.endsWith('.csv')) {
    rawItems = parseCSV(rawContent);
  } else {
    throw new Error('Unsupported file type. Please provide a .json or .csv file.');
  }

  console.log(`Parsed Rows : ${rawItems.length}\n`);

  const seenIds = new Set<string>();
  const duplicates: string[] = [];
  const validQuestions: NonNullable<ValidationResult['cleanData']>[] = [];
  const allErrors: string[] = [];

  const diffCounts: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const levelCounts: Record<number, number> = {};
  const colorCounts: Record<string, number> = {};

  for (let i = 0; i < rawItems.length; i++) {
    const validation = validateQuestion(rawItems[i], i + 1);
    if (!validation.valid) {
      allErrors.push(...validation.errors);
      continue;
    }

    const clean = validation.cleanData!;
    if (seenIds.has(clean.external_id)) {
      duplicates.push(clean.external_id);
    } else {
      seenIds.add(clean.external_id);
    }

    validQuestions.push(clean);
    diffCounts[clean.difficulty] = (diffCounts[clean.difficulty] || 0) + 1;
    levelCounts[clean.level] = (levelCounts[clean.level] || 0) + 1;
    colorCounts[clean.color] = (colorCounts[clean.color] || 0) + 1;
  }

  console.log('----------------- VALIDATION REPORT -----------------');
  console.log(`Total Rows Parsed   : ${rawItems.length}`);
  console.log(`Valid Records       : ${validQuestions.length}`);
  console.log(`Invalid Records     : ${rawItems.length - validQuestions.length}`);
  console.log(`Duplicate IDs in file: ${duplicates.length}`);
  console.log('Difficulty breakdown: ', diffCounts);
  console.log('Level breakdown     : ', levelCounts);
  console.log('Color breakdown     : ', colorCounts);

  if (allErrors.length > 0) {
    console.log('\n--- Sample Errors (first 10) ---');
    allErrors.slice(0, 10).forEach(e => console.log('  ❌', e));
  }

  if (isDryRun) {
    console.log('\n[DRY RUN COMPLETE] No records were written to the database.');
    return {
      total: rawItems.length,
      valid: validQuestions.length,
      invalid: rawItems.length - validQuestions.length,
      duplicates: duplicates.length,
      diffCounts,
      levelCounts,
      colorCounts,
      errors: allErrors
    };
  }

  // Live Import
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcajfrrlgksvequyallj.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWpmcnJsZ2tzdmVxdXlhbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4OTg0NzUsImV4cCI6MjEwNTQ3NDQ3NX0.YyfTyfFe4DSykqSa7ELmeQIjaiCcKMrVPWMNWHS4p7Q';

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\nSubmitting to Supabase database via fn_import_questions...');
  const BATCH_SIZE = 100;
  let totalInserted = 0;
  let totalUpdated = 0;

  for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
    const batch = validQuestions.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.rpc('fn_import_questions', {
      p_questions: batch,
      p_dry_run: false
    });

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      throw error;
    }

    totalInserted += (data as any)?.inserted || 0;
    totalUpdated += (data as any)?.updated || 0;
    process.stdout.write(`Processed ${Math.min(i + BATCH_SIZE, validQuestions.length)} / ${validQuestions.length}...\r`);
  }

  console.log(`\n\n✅ IMPORT COMPLETED SUCCESSFULLY!`);
  console.log(`Total Inserted: ${totalInserted}`);
  console.log(`Total Updated : ${totalUpdated}`);
  console.log('====================================================\n');

  return {
    total: rawItems.length,
    valid: validQuestions.length,
    inserted: totalInserted,
    updated: totalUpdated
  };
}

// CLI entrypoint
if (require.main === module || process.argv[1]?.includes('import_questions')) {
  const args = process.argv.slice(2);
  let targetFile = 'questions_master_1000.json';
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      targetFile = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  runImporter(path.resolve(process.cwd(), targetFile), dryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}
