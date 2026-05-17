import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db-neon';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query as { id: string };

  try {
    const rows = await sql`SELECT photo_url FROM guest_entries WHERE id = ${id}`;
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    // Cache for 1 hour — Cloudinary URLs are stable
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({ photoUrl: rows[0].photo_url ?? null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Database error';
    return res.status(500).json({ error: msg });
  }
}
