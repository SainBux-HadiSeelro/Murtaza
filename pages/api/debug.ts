import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qgpnzdhapyxdfzsbylwp.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_...';

  let connectionTest = 'testing...';
  try {
    const { data, error } = await supabase.from('guest_entries').select('id').limit(1);
    connectionTest = error ? `❌ ERROR: ${error.message}` : `✅ Connected (${data?.length ?? 0} rows)`;
  } catch (e) {
    connectionTest = `❌ CRASH: ${e}`;
  }

  return res.status(200).json({
    supabaseUrl: url.substring(0, 40) + '...',
    keySet: key ? 'YES' : 'NO',
    connectionTest,
  });
}
