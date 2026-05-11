import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Test Supabase connection
  const { data, error } = await supabase
    .from('guest_entries')
    .select('id')
    .limit(1);

  return res.status(200).json({
    supabaseUrl: url ? url.substring(0, 30) + '...' : 'MISSING',
    anonKey: key ? key.substring(0, 20) + '...' : 'MISSING',
    connectionTest: error ? `ERROR: ${error.message}` : 'OK',
    rowCount: data?.length ?? 0,
  });
}
