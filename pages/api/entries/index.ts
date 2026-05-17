import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { uploadBase64Photo } from '@/lib/cloudinary';
import type { EventType } from '@/lib/types';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

function rowToEntry(row: Record<string, unknown>, includePhoto = true) {
  return {
    id:                row.id,
    name:              row.name,
    phone:             row.phone ?? '',
    message:           row.message,
    photoUrl:          includePhoto
      ? (row.photo_url ?? null)
      : (row.photo_url ? '__has_photo__' : null),
    event:             row.event,
    status:            row.status,
    showPhoto:         row.show_photo,
    timestamp:         Number(row.timestamp),
    originalPhotoKB:   row.original_photo_kb   != null ? Number(row.original_photo_kb)   : null,
    compressedPhotoKB: row.compressed_photo_kb != null ? Number(row.compressed_photo_kb) : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { event, status, full } = req.query;
    const includePhoto = full === '1';

    try {
      let query = supabase
        .from('guest_entries')
        .select('id,name,phone,message,photo_url,event,status,show_photo,timestamp,original_photo_kb,compressed_photo_kb');

      if (event)  query = query.eq('event', event as string);
      if (status) query = query.eq('status', status as string);

      if (status === 'approved') {
        query = query.order('timestamp', { ascending: true }).limit(100);
      } else {
        query = query.order('timestamp', { ascending: false });
      }

      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });

      return res.status(200).json(
        (data ?? []).map((r) => rowToEntry(r as Record<string, unknown>, includePhoto))
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Database error';
      return res.status(500).json({ error: msg });
    }
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, message, photoUrl, event, originalPhotoKB, compressedPhotoKB } = req.body as {
      name: string; message: string;
      photoUrl: string | null; event: EventType;
      originalPhotoKB?: number | null;
      compressedPhotoKB?: number | null;
    };

    if (!name?.trim() || !message?.trim() || !event) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    // Upload photo to Cloudinary if base64
    let finalPhotoUrl: string | null = null;
    if (photoUrl && photoUrl.startsWith('data:')) {
      try {
        finalPhotoUrl = await uploadBase64Photo(photoUrl, id);
      } catch (e) {
        console.error('Cloudinary upload error:', e);
        finalPhotoUrl = null;
      }
    } else if (photoUrl) {
      finalPhotoUrl = photoUrl;
    }

    const { data, error } = await supabase
      .from('guest_entries')
      .insert({
        id,
        name:                name.trim(),
        phone:               '',
        message:             message.trim(),
        photo_url:           finalPhotoUrl,
        event,
        status:              'pending',
        show_photo:          true,
        timestamp:           Date.now(),
        original_photo_kb:   originalPhotoKB ?? null,
        compressed_photo_kb: compressedPhotoKB ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(rowToEntry(data as Record<string, unknown>, true));
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
