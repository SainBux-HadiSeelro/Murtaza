import { useState, useRef, useCallback, ChangeEvent, FormEvent } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { addGuestEntry } from '@/lib/api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function Home() {
  const [name, setName]       = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, message: false });
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [menuOpen, setMenuOpen]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be smaller than 10MB.'); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removePhoto = useCallback(() => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, message: true });
    if (!name.trim() || !message.trim()) return;
    setFormState('submitting');
    setErrorMsg('');
    try {
      await addGuestEntry({ name, phone: '', message, photoFile: photo, event: 'shadi' });
      setFormState('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Something went wrong. Please try again.');
      setFormState('error');
    }
  };

  // ── Thank-you screen ──────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <>
        <Head><title>Thank You — Murtaza & Family</title></Head>
        <div className="bg-wedding-form flex items-center justify-center p-6 min-h-screen">
          <div className="glass-card p-10 max-w-md w-full text-center animate-fade-in">
            <div className="text-7xl mb-6 float-anim">🎊</div>
            <h2 className="text-3xl font-bold text-gold-shimmer mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Thank You!
            </h2>
            <p className="text-white/80 text-lg mb-2">Your message has been submitted successfully.</p>
            <p className="text-white/50 text-sm mb-8">JazakAllah Khair! 🤲</p>
            <div className="text-4xl space-x-2">
              <span>💍</span><span>🌸</span><span>✨</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Murtaza & Family — Wedding</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="bg-wedding-form flex items-center justify-center p-4 py-8 min-h-screen">
        {/* Decorative blobs */}
        <div className="fixed top-0 left-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── Corner Menu (top-right) ── */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            aria-label="Menu"
          >
            <span className="text-white text-lg">{menuOpen ? '✕' : '☰'}</span>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute top-12 right-0 rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'rgba(15,10,30,0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                minWidth: '180px',
              }}
            >
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <span>🔐</span> Admin Panel
              </Link>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <Link
                href="/slideshow/shadi"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
              >
                <span>📺</span> Slideshow
              </Link>
            </div>
          )}
        </div>

        {/* ── Form Content ── */}
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-24 h-24 rounded-full opacity-20 blur-xl"
                style={{ background: 'radial-gradient(circle, #fda4af, #f59e0b)' }} />
              <div className="relative z-10" style={{ animation: 'float 4s ease-in-out infinite' }}>
                <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 8px rgba(253,164,175,0.8))' }}>👰</div>
              </div>
              <div className="relative z-10 mx-3" style={{ animation: 'float 4s ease-in-out 0.5s infinite' }}>
                <div className="text-2xl" style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.9))' }}>💛</div>
              </div>
              <div className="relative z-10" style={{ animation: 'float 4s ease-in-out 1s infinite' }}>
                <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 8px rgba(253,164,175,0.8))' }}>🤵</div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mb-3">
              {['✨', '💍', '✨'].map((s, i) => (
                <span key={i} className="text-sm opacity-70"
                  style={{ animation: `float 3s ease-in-out ${i * 0.4}s infinite` }}>{s}</span>
              ))}
            </div>
            <p className="text-white/70 text-lg mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Happy Wedding
            </p>
            <div className="w-16 h-px bg-amber-400/40 mx-auto mb-2" />
            <h1 className="text-4xl font-bold text-gold-shimmer mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Murtaza &amp; Family
            </h1>
            <p className="text-white/50 text-sm mt-2 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
              &ldquo;May Allah bless this union with love and barakah.&rdquo;
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {['✦', '✦', '✦'].map((s, i) => <span key={i} className="text-amber-400/60 text-xs">{s}</span>)}
            </div>
          </div>

          {/* Form card */}
          <div className="glass-card p-6 sm:p-8">
            <p className="text-center text-amber-300/80 text-sm font-medium mb-5 tracking-wide uppercase"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Share your wishes &amp; prayers
            </p>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Enter your full name..."
                  className={`form-input ${touched.name && !name.trim() ? 'error' : ''}`}
                  autoComplete="name"
                />
                {touched.name && !name.trim() && (
                  <p className="mt-1 text-red-400 text-xs">Name is required.</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  placeholder="Write your message here..."
                  rows={4}
                  className={`form-input resize-none ${touched.message && !message.trim() ? 'error' : ''}`}
                />
                {touched.message && !message.trim() && (
                  <p className="mt-1 text-red-400 text-xs">Message is required.</p>
                )}
              </div>

              {/* Photo */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Photo <span className="text-white/40 text-xs font-normal">(Optional)</span>
                </label>
                {!photoPreview ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-amber-400/50 hover:bg-white/5 transition-all duration-200 group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                    <p className="text-white/50 text-sm">Tap to add a photo</p>
                    <p className="text-white/30 text-xs mt-1">JPG, PNG, WEBP — max 10MB</p>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <Image src={photoPreview} alt="Preview" width={400} height={300}
                      className="w-full h-48 object-cover rounded-xl" unoptimized />
                    <button type="button" onClick={removePhoto}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
                      aria-label="Remove photo">✕</button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white/70 text-xs px-2 py-1 rounded-lg">
                      {photo?.name}
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoChange} className="hidden" aria-label="Upload photo" />
              </div>

              {/* Error */}
              {formState === 'error' && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-300 text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={formState === 'submitting'}
                className="btn-primary bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 mt-2">
                {formState === 'submitting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Send Message</span><span>💌</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            Made with ❤️ By Sain Bux Brother of Murtaza
          </p>
        </div>
      </div>
    </>
  );
}
