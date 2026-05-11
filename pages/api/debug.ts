import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Don't import supabase here — just check env vars first
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL:      url  ? `SET (${url.substring(0, 35)}...)` : '❌ MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key  ? `SET (${key.substring(0, 20)}...)` : '❌ MISSING',
    NEXT_PUBLIC_ADMIN_PASSWORD:    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? 'SET' : '❌ MISSING',
    NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL ?? '❌ MISSING',
  };

  // If env vars are set, test Supabase connection
  let connectionTest = 'skipped (env vars missing)';
  if (url && key) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(url, key);
      const { error } = await sb.from('guest_entries').select('id').limit(1);
      connectionTest = error ? `❌ ERROR: ${error.message}` : '✅ Connected';
    } catch (e) {
      connectionTest = `❌ CRASH: ${e}`;
    }
  }

  return res.status(200).json({ envCheck, connectionTest });
}
