import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db-neon';
import type { EventType } from '@/lib/types';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

function rowToEntry(row: Record<string, unknown>, includePhoto = true) {
  return {
    id:                 row.id,
    name:               row.name,
    phone:              row.phone,
    message:            row.message,
    photoUrl:           includePhoto ? (row.photo_url ?? null) : (row.photo_url ? '__has_photo__' : null),
    event:              row.event,
    status:             row.status,
    showPhoto:          row.show_photo,
    timestamp:          Number(row.timestamp),
    originalPhotoKB:    row.original_photo_kb   != null ? Number(row.original_photo_kb)   : null,
    compressedPhotoKB:  row.compressed_photo_kb != null ? Number(row.compressed_photo_kb) : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { event, status, full } = req.query;
    const includePhoto = full === '1';

    try {
      let rows;
      if (event && status) {
        rows = await sql`
          SELECT id, name, phone, message, photo_url, event, status, show_photo, timestamp, original_photo_kb, compressed_photo_kb
          FROM guest_entries
          WHERE event = ${event as string} AND status = ${status as string}
          ORDER BY timestamp ASC
        `;
      } else if (event) {
        rows = await sql`
          SELECT id, name, phone, message, photo_url, event, status, show_photo, timestamp, original_photo_kb, compressed_photo_kb
          FROM guest_entries
          WHERE event = ${event as string}
          ORDER BY timestamp DESC
        `;
      } else {
        rows = await sql`
          SELECT id, name, phone, message, photo_url, event, status, show_photo, timestamp, original_photo_kb, compressed_photo_kb
          FROM guest_entries
          ORDER BY timestamp DESC
        `;
      }

      return res.status(200).json(rows.map((r) => rowToEntry(r as Record<string, unknown>, includePhoto)));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Database error';
      console.error('GET error:', msg);
      return res.status(500).json({ error: msg });
    }
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, message, photoUrl, event, originalPhotoKB, compressedPhotoKB } = req.body as {
      name: string; message: string;
      photoUrl: string | null; event: EventType;
      originalPhotoKB?: number | null; compressedPhotoKB?: number | null;
    };

    if (!name?.trim() || !message?.trim() || !event) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    try {
      const rows = await sql`
        INSERT INTO guest_entries (id, name, phone, message, photo_url, event, status, show_photo, timestamp, original_photo_kb, compressed_photo_kb)
        VALUES (${id}, ${name.trim()}, '', ${message.trim()}, ${photoUrl ?? null}, ${event}, 'pending', true, ${Date.now()}, ${originalPhotoKB ?? null}, ${compressedPhotoKB ?? null})
        RETURNING *
      `;
      return res.status(201).json(rowToEntry(rows[0] as Record<string, unknown>, true));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Database error';
      console.error('POST error:', msg);
      return res.status(500).json({ error: msg });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
