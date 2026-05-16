import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import type { EventType } from '@/lib/types';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

// List view — NO photo_url (too large, loaded separately on demand)
function rowToEntryList(row: Record<string, unknown>) {
  return {
    id:        row.id,
    name:      row.name,
    phone:     row.phone,
    message:   row.message,
    photoUrl:  row.photo_url ? '__has_photo__' : null, // just a flag
    event:     row.event,
    status:    row.status,
    showPhoto: row.show_photo,
    timestamp: row.timestamp,
  };
}

// Full entry — includes photo_url (used for slideshow + single fetch)
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
    const { event, status, full } = req.query;

    // ?full=1 → include photo_url (slideshow uses this)
    const selectFields = full === '1'
      ? '*'
      : 'id,name,phone,message,photo_url,event,status,show_photo,timestamp';

    let query = supabase
      .from('guest_entries')
      .select(selectFields)
      .order('timestamp', { ascending: false });

    if (event)  query = query.eq('event', event as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const mapper = full === '1' ? rowToEntry : rowToEntryList;
    return res.status(200).json((data ?? []).map(mapper));
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, message, photoUrl, event } = req.body as {
      name: string; message: string;
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
        name:       name.trim(),
        phone:      '',
        message:    message.trim(),
        photo_url:  photoUrl ?? null,
        event,
        status:     'pending',
        show_photo: true,
        timestamp:  Date.now(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(rowToEntry(data));
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
