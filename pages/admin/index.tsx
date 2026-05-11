import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import QRCode from 'qrcode';
import { fetchEntries, updateEntryStatus, togglePhotoVisibility, deleteEntry } from '@/lib/api';
import type { EventType, GuestEntry, StatusType } from '@/lib/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'hadi&admin12';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const POLL_INTERVAL = 5000; // refresh every 5 seconds

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      onLogin();
    } else {
      setError('Galat password. Dobara koshish karein.');
      setPw('');
    }
  };

  return (
    <div className="bg-wedding-admin flex items-center justify-center min-h-screen p-6">
      <div className="glass-card p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-gold-shimmer mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
          Admin Panel
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(''); }}
            placeholder="Password dalein..."
            className="form-input"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

// ─── QR Code Modal ────────────────────────────────────────────────────────────
function QRModal({ event, onClose }: { event: EventType; onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const url = `${APP_URL}/form/${event}`;

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 300, margin: 2,
      color: { dark: '#1a0a2e', light: '#fef3c7' },
    }).then(setQrDataUrl);
  }, [url]);

  const download = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${event}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gold-shimmer mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          🌸 Shadi QR Code
        </h3>
        <p className="text-white/50 text-xs mb-4 break-all">{url}</p>
        {qrDataUrl
          ? <Image src={qrDataUrl} alt={`QR for ${event}`} width={260} height={260} className="mx-auto rounded-xl mb-4" unoptimized />
          : <div className="w-64 h-64 mx-auto bg-white/10 rounded-xl animate-pulse mb-4" />
        }
        <div className="flex gap-3">
          <button onClick={download} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors">
            ⬇ Download
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Entry Card ───────────────────────────────────────────────────────────────
function EntryCard({ entry, onUpdate, onDelete }: {
  entry: GuestEntry;
  onUpdate: (updated: GuestEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatus = async (status: StatusType) => {
    setLoading(status);
    try {
      const updated = await updateEntryStatus(entry.id, status);
      onUpdate(updated);
    } finally {
      setLoading(null);
    }
  };

  const handleTogglePhoto = async () => {
    setLoading('photo');
    try {
      const updated = await togglePhotoVisibility(entry.id, !entry.showPhoto);
      onUpdate(updated);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      // First click — show confirm state
      setConfirmDelete(true);
      // Auto-reset after 3 seconds if not confirmed
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    // Second click — actually delete
    setLoading('delete');
    try {
      await deleteEntry(entry.id);
      onDelete(entry.id);
    } catch (e) {
      console.error(e);
      setLoading(null);
      setConfirmDelete(false);
    }
  };

  const statusBadge = {
    pending:  <span className="badge-pending">⏳ Pending</span>,
    approved: <span className="badge-approved">✅ Approved</span>,
    rejected: <span className="badge-rejected">❌ Rejected</span>,
  }[entry.status];

  const date = new Date(entry.timestamp).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Photo thumbnail */}
          <div className="flex-shrink-0">
            {entry.photoUrl ? (
              <div className="relative">
                <Image src={entry.photoUrl} alt={entry.name} width={64} height={64}
                  className="w-16 h-16 rounded-lg object-cover" unoptimized />
                {!entry.showPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">Hidden</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">👤</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{entry.name}</h3>
              {statusBadge}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">{entry.phone}</p>
            <p className="text-gray-700 text-sm mt-1 line-clamp-2" dir="auto">{entry.message}</p>
            <p className="text-gray-400 text-xs mt-1">{date}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button onClick={() => handleStatus('approved')}
            disabled={loading !== null || entry.status === 'approved'}
            className="flex-1 min-w-[80px] py-1.5 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium border border-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {loading === 'approved' ? '...' : '✓ Approve'}
          </button>
          <button onClick={() => handleStatus('rejected')}
            disabled={loading !== null || entry.status === 'rejected'}
            className="flex-1 min-w-[80px] py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {loading === 'rejected' ? '...' : '✗ Reject'}
          </button>
          {entry.photoUrl && (
            <button onClick={handleTogglePhoto} disabled={loading !== null}
              className={`flex-1 min-w-[110px] py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                entry.showPhoto
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
              }`}>
              {loading === 'photo' ? '...' : entry.showPhoto ? '🖼 Photo: ON' : '🚫 Photo: OFF'}
            </button>
          )}
        </div>

        {/* Delete button — full width, separate row */}
        <div className="mt-2">
          <button
            onClick={handleDelete}
            disabled={loading === 'delete'}
            className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              confirmDelete
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
            }`}
          >
            {loading === 'delete'
              ? '⏳ Deleting...'
              : confirmDelete
              ? '⚠️ Confirm? Dobara click karo — permanently delete hoga!'
              : '🗑️ Delete Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Event Tab ────────────────────────────────────────────────────────────────
function EventTab({ event }: { event: EventType }) {
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [filter, setFilter] = useState<StatusType | 'all'>('all');
  const [qrOpen, setQrOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchEntries(event);
      setEntries(data);
      setLastRefresh(new Date().toLocaleTimeString('en-PK'));
    } catch (e) {
      console.error('Failed to load entries', e);
    }
  }, [event]);

  // Initial load + polling every 5s
  useEffect(() => {
    load();
    pollRef.current = setInterval(load, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  // Optimistic update when admin clicks approve/reject/toggle
  const handleUpdate = useCallback((updated: GuestEntry) => {
    setEntries((prev) => prev.map((e) => e.id === updated.id ? updated : e));
  }, []);

  // Remove entry from list after delete
  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter);
  const counts = {
    all: entries.length,
    pending:  entries.filter((e) => e.status === 'pending').length,
    approved: entries.filter((e) => e.status === 'approved').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && <span className="text-gray-400 text-xs">Updated: {lastRefresh}</span>}
          <button onClick={load} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors">
            🔄 Refresh
          </button>
          <button onClick={() => setQrOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors">
            📱 QR Code
          </button>
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>Koi entry nahi mili.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {qrOpen && <QRModal event={event} onClose={() => setQrOpen(false)} />}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  }, []);

  if (!mounted) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <>
      <Head><title>Admin Panel — Wedding Guest System</title></Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💍</span>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Wedding Admin
                </h1>
                <p className="text-gray-400 text-xs">Guest Message System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/slideshow/shadi" target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 hover:bg-rose-100 transition-colors">
                📺 Shadi Slideshow
              </a>
              <button onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm transition-colors">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 w-fit mb-6">
            <div className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-indigo-600 text-white shadow-sm">
              🌸 Shadi
            </div>
          </div>
          <EventTab event="shadi" />

          {/* Mobile slideshow link */}
          <div className="sm:hidden mt-6 pb-6">
            <a href="/slideshow/shadi" target="_blank" rel="noopener noreferrer"
              className="block py-2.5 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200 text-center">
              📺 Shadi Slideshow
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
