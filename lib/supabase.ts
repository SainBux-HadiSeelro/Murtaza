import { createClient } from '@supabase/supabase-js';

// Use env vars if available, fallback to hardcoded values for Vercel
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://qgpnzdhapyxdfzsbylwp.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_V_5Jybi0Zf7hIsZ5ps_mZQ_zLz3WzU0';

export const supabase = createClient(supabaseUrl, supabaseKey);
