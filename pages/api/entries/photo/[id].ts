/**
 * GET /api/entries/photo/:id
 * Returns just the photo_url for a single entry (on-demand loading)
 */
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

  // Cache for 1 hour
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json({ photoUrl: data.photo_url ?? null });
}
