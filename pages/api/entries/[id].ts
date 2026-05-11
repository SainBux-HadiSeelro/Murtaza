import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

function rowToEntry(row: Record<string, unknown>) {
  return {
    id:        row.id,
    name:      row.name,
    phone:     row.phone,
    message:   row.message,
    photoUrl:  row.photo_url ?? null,
    event:     row.event,
    status:    row.status,
    showPhoto: row.show_photo,
    timestamp: row.timestamp,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  // ── PATCH ──────────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if ('status'    in body) patch['status']     = body.status;
    if ('showPhoto' in body) patch['show_photo'] = body.showPhoto;

    if (Object.keys(patch).length === 0)
      return res.status(400).json({ error: 'Nothing to update' });

    const { data, error } = await supabase
      .from('guest_entries')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data)  return res.status(404).json({ error: 'Entry not found' });
    return res.status(200).json(rowToEntry(data));
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('guest_entries')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['PATCH', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
