/**
 * Client-side API helpers — replaces Firebase calls entirely.
 * Data is stored in data/guests.json on the server.
 */
import type { EventType, GuestEntry, StatusType } from './types';

// ─── Convert File to base64 data URL ─────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Submit a new guest entry ─────────────────────────────────────────────────
export async function addGuestEntry(data: {
  name: string;
  phone: string;
  message: string;
  photoFile: File | null;
  event: EventType;
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
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to submit');
  }

  return res.json();
}

// ─── Fetch all entries for an event (admin) ───────────────────────────────────
export async function fetchEntries(event: EventType): Promise<GuestEntry[]> {
  const res = await fetch(`/api/entries?event=${event}`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

// ─── Fetch approved entries for slideshow ────────────────────────────────────
export async function fetchApprovedEntries(event: EventType): Promise<GuestEntry[]> {
  const res = await fetch(`/api/entries?event=${event}&status=approved`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

// ─── Update entry status ──────────────────────────────────────────────────────
export async function updateEntryStatus(id: string, status: StatusType): Promise<GuestEntry> {
  const res = await fetch(`/api/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

// ─── Toggle photo visibility ──────────────────────────────────────────────────
export async function togglePhotoVisibility(id: string, showPhoto: boolean): Promise<GuestEntry> {
  const res = await fetch(`/api/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ showPhoto }),
  });
  if (!res.ok) throw new Error('Failed to update photo visibility');
  return res.json();
}

// ─── Delete entry permanently ─────────────────────────────────────────────────
export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`/api/entries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete entry');
}
