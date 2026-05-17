import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db-neon';

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
    timestamp: Number(row.timestamp),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  // ── PATCH ──────────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const body = req.body as Record<string, unknown>;

    try {
      let rows;
      if ('status' in body && 'showPhoto' in body) {
        rows = await sql`
          UPDATE guest_entries SET status = ${body.status as string}, show_photo = ${body.showPhoto as boolean}
          WHERE id = ${id} RETURNING *
        `;
      } else if ('status' in body) {
        rows = await sql`
          UPDATE guest_entries SET status = ${body.status as string}
          WHERE id = ${id} RETURNING *
        `;
      } else if ('showPhoto' in body) {
        rows = await sql`
          UPDATE guest_entries SET show_photo = ${body.showPhoto as boolean}
          WHERE id = ${id} RETURNING *
        `;
      } else {
        return res.status(400).json({ error: 'Nothing to update' });
      }

      if (!rows.length) return res.status(404).json({ error: 'Entry not found' });
      return res.status(200).json(rowToEntry(rows[0] as Record<string, unknown>));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Database error';
      return res.status(500).json({ error: msg });
    }
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM guest_entries WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Database error';
      return res.status(500).json({ error: msg });
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
