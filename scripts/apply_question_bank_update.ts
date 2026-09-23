import { supabase } from '../src/lib/supabase';
import fs from 'fs';

async function applyUpdate() {
  console.log('Loading master_unique_questions.json...');
  const master: any[] = JSON.parse(fs.readFileSync('master_unique_questions.json', 'utf8'));
  console.log(`Total questions to upload: ${master.length}`);

  const BATCH_SIZE = 50;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (let i = 0; i < master.length; i += BATCH_SIZE) {
    const batch = master.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(master.length / BATCH_SIZE);

    try {
      const { data, error } = await supabase.rpc('fn_import_questions', {
        p_questions: batch,
        p_dry_run: false
      });

      if (error) {
        console.error(`Batch ${batchNum}/${totalBatches} RPC Error:`, error);
        totalErrors += batch.length;
      } else {
        const res = data as any;
        totalInserted += res.inserted || 0;
        totalUpdated += res.updated || 0;
        if (res.invalid > 0) {
          console.warn(`Batch ${batchNum}/${totalBatches} has ${res.invalid} invalid rows:`, res.errors);
          totalErrors += res.invalid;
        } else {
          console.log(`Batch ${batchNum}/${totalBatches} applied: ${res.inserted} inserted, ${res.updated} updated.`);
        }
      }
    } catch (err) {
      console.error(`Batch ${batchNum}/${totalBatches} exception:`, err);
      totalErrors += batch.length;
    }
  }

  console.log('\n=======================================');
  console.log('MASTER BANK UPLOAD COMPLETE');
  console.log(`Total Inserted: ${totalInserted}`);
  console.log(`Total Updated:  ${totalUpdated}`);
  console.log(`Total Errors:   ${totalErrors}`);
  console.log('=======================================');
}

applyUpdate();
