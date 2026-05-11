import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import type { EventType } from '@/lib/types';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

// ─── Map DB row → GuestEntry ──────────────────────────────────────────────────
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

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { event, status } = req.query;

    let query = supabase
      .from('guest_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (event)  query = query.eq('event', event as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json((data ?? []).map(rowToEntry));
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, phone, message, photoUrl, event } = req.body as {
      name: string; phone: string; message: string;
      photoUrl: string | null; event: EventType;
    };

    if (!name?.trim() || !message?.trim() || !event) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (event !== 'shadi') {
      return res.status(400).json({ error: 'Invalid event' });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    const { data, error } = await supabase
      .from('guest_entries')
      .insert({
        id,
        name:      name.trim(),
        phone:     '',
        message:   message.trim(),
        photo_url: photoUrl ?? null,
        event,
        status:    'pending',
        show_photo: true,
        timestamp: Date.now(),
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(rowToEntry(data));
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
