// Run: node scripts/add-photo-size-columns.js
// Note: This migration is for reference — Supabase columns should ideally be
// added via the Supabase SQL Editor at https://app.supabase.com

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ysmccfszlutetlathgpo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_y3rk5z-Itrz0JO4V4s-eVQ_WGauRCFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('ℹ️  To add columns, run this SQL in the Supabase SQL Editor:');
  console.log(`
ALTER TABLE guest_entries ADD COLUMN IF NOT EXISTS original_photo_kb INTEGER;
ALTER TABLE guest_entries ADD COLUMN IF NOT EXISTS compressed_photo_kb INTEGER;
  `);
  console.log('✅ Go to: https://app.supabase.com → SQL Editor → paste above → Run');
}

migrate();
