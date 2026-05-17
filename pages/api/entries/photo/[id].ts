import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query as { id: string };

  const { data, error } = await supabase
    .from('guest_entries')
    .select('photo_url')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data)  return res.status(404).json({ error: 'Not found' });

  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json({ photoUrl: (data as Record<string, unknown>).photo_url ?? null });
}
