import type { EventType, GuestEntry, StatusType } from './types';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addGuestEntry(data: {
  name: string;
  phone: string;
  message: string;
  photoFile: File | null;
  event: EventType;
  photoSizeInfo?: { originalKB: number; compressedKB: number } | null;
}): Promise<GuestEntry> {
  let photoUrl: string | null = null;
  if (data.photoFile) {
    photoUrl = await fileToBase64(data.photoFile);
  }

  const res = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      message: data.message,
      photoUrl,
      event: data.event,
      originalPhotoKB:    data.photoSizeInfo?.originalKB    ?? null,
      compressedPhotoKB:  data.photoSizeInfo?.compressedKB  ?? null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to submit');
  }
  return res.json();
}

// Admin list — fast, no photos
export async function fetchEntries(event: EventType): Promise<GuestEntry[]> {
  const res = await fetch(`/api/entries?event=${event}`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

// Slideshow — with full=1 to get Cloudinary photo URLs (URLs are tiny, not base64)
export async function fetchApprovedEntries(event: EventType): Promise<GuestEntry[]> {
  const res = await fetch(`/api/entries?event=${event}&status=approved&full=1`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

// Fetch a single approved entry WITH its photo by slide index (0-based).
export async function fetchSlidePhoto(event: EventType, pageIndex: number): Promise<GuestEntry | null> {
  const res = await fetch(`/api/entries?event=${event}&status=approved&full=1&page=${pageIndex}`);
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

// Fetch single photo on demand (admin preview)
export async function fetchEntryPhoto(id: string): Promise<string | null> {
  const res = await fetch(`/api/entries/photo/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.photoUrl ?? null;
}

export async function updateEntryStatus(id: string, status: StatusType): Promise<GuestEntry> {
  const res = await fetch(`/api/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function togglePhotoVisibility(id: string, showPhoto: boolean): Promise<GuestEntry> {
  const res = await fetch(`/api/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ showPhoto }),
  });
  if (!res.ok) throw new Error('Failed to update photo visibility');
  return res.json();
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete entry');
}
