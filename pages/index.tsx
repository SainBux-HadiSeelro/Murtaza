import { useState, useRef, useCallback, ChangeEvent, FormEvent } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { addGuestEntry } from '@/lib/api';
import { compressImage } from '@/lib/imageUtils';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function Home() {
  const [name, setName]         = useState('');
  const [message, setMessage]   = useState('');
  const [photo, setPhoto]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSizes, setPhotoSizes]     = useState<{ original: number; compressed: number } | null>(null);
  const [compressing, setCompressing]   = useState(false);
  const [photoError, setPhotoError]     = useState<string | null>(null);
  const [touched, setTouched]   = useState({ name: false, message: false });
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [menuOpen, setMenuOpen]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Photo selection + auto compress ────────────────────────────────────────
  const handlePhotoChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError(null);
    setPhotoSizes(null);
    if (!file) return;

    // Only check file type — no size limit
    if (!file.type.startsWith('image/')) {
      setPhotoError(`❌ "${file.name}" is not an image. Please select a JPG, PNG, or WEBP.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setCompressing(true);
    try {
      const originalKB = Math.round(file.size / 1024);
      const result = await compressImage(file, 300, 1200);
      setPhoto(result.file);
      setPhotoPreview(result.dataUrl);
      setPhotoSizes({ original: originalKB, compressed: result.compressedKB });
    } catch {
      setPhotoError('❌ Could not process this photo. Please try a different image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setCompressing(false);
    }
  }, []);

  const removePhoto = useCallback(() => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoSizes(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, message: true });
    if (!name.trim() || !message.trim()) return;
    if (compressing) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      await addGuestEntry({
        name,
        phone: '',
        message,
        photoFile: photo,
        event: 'shadi',
        photoSizeInfo: photoSizes ? { originalKB: photoSizes.original, compressedKB: photoSizes.compressed } : null,
      });
      setFormState('success');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('size') || msg.includes('limit') || msg.includes('15mb')) {
        setErrorMsg('❌ Photo still too large after compression. Please try a smaller image.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setErrorMsg('❌ Network error. Please check your connection and try again.');
      } else {
        setErrorMsg(`❌ ${msg}`);
      }
      setFormState('error');
    }
  };

  // ── Thank-you screen ────────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <>
        <Head><title>Thank You — Murtaza & Family</title></Head>
        <div className="flex items-center justify-center p-6 min-h-screen" style={{
          background: 'linear-gradient(135deg, #0a1f14 0%, #1a3a2a 25%, #2d5a3d 50%, #1a3a2a 75%, #0a1f14 100%)',
        }}>
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

      <div className="flex items-center justify-center p-4 py-8 min-h-screen" style={{
        background: 'linear-gradient(160deg, #071a0f 0%, #0d2b1a 30%, #1a4a2e 55%, #0d2b1a 75%, #071a0f 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <style>{`
          @keyframes petalFallForm {
            0%   { transform: translateY(-40px) rotate(0deg); opacity: 0; }
            10%  { opacity: 0.7; }
            90%  { opacity: 0.4; }
            100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
          }
          @keyframes bokehPulse {
            0%, 100% { transform: scale(1);    opacity: 0.06; }
            50%       { transform: scale(1.15); opacity: 0.13; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-10px); }
          }
        `}</style>

        {/* Bokeh */}
        {[
          { left:'5%',  top:'10%', size:'180px', dur:'7s',  delay:'0s'   },
          { left:'80%', top:'8%',  size:'220px', dur:'9s',  delay:'1s'   },
          { left:'15%', top:'65%', size:'150px', dur:'6s',  delay:'2s'   },
          { left:'70%', top:'60%', size:'200px', dur:'8s',  delay:'0.5s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'fixed', left: b.left, top: b.top,
            width: b.size, height: b.size, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,163,100,0.5), transparent)',
            filter: 'blur(30px)',
            animation: `bokehPulse ${b.dur} ease-in-out ${b.delay} infinite`,
            pointerEvents: 'none', zIndex: 0,
          }} />
        ))}

        {/* Petals */}
        {[
          { left:'5%',  dur:'8s',  delay:'0s',   size:'1.2rem', emoji:'🌿' },
          { left:'20%', dur:'11s', delay:'1.5s', size:'0.9rem', emoji:'🍃' },
          { left:'40%', dur:'7s',  delay:'0.5s', size:'1.1rem', emoji:'🌿' },
          { left:'60%', dur:'9s',  delay:'2s',   size:'0.8rem', emoji:'🍃' },
          { left:'80%', dur:'8s',  delay:'0.8s', size:'1rem',   emoji:'🌿' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'fixed', left: p.left, top: '-2rem',
            fontSize: p.size, opacity: 0.5,
            animation: `petalFallForm ${p.dur} linear ${p.delay} infinite`,
            pointerEvents: 'none', zIndex: 0,
          }}>{p.emoji}</div>
        ))}

        {/* Shimmer lines */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, rgba(134,197,143,0.6), rgba(212,175,55,0.4), rgba(134,197,143,0.6), transparent)', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, rgba(134,197,143,0.6), rgba(212,175,55,0.4), rgba(134,197,143,0.6), transparent)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Corner Menu */}
        <div className="fixed top-4 right-4 z-50">
          <button onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            aria-label="Menu">
            <span className="text-white text-lg">{menuOpen ? '✕' : '☰'}</span>
          </button>
          {menuOpen && (
            <div className="absolute top-12 right-0 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(15,10,30,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', minWidth: '180px' }}>
              <Link href="/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm">
                <span>🔐</span> Admin Panel
              </Link>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <Link href="/slideshow/shadi" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm">
                <span>📺</span> Slideshow
              </Link>
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-24 h-24 rounded-full opacity-20 blur-xl" style={{ background: 'radial-gradient(circle, #fda4af, #f59e0b)' }} />
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
                <span key={i} className="text-sm opacity-70" style={{ animation: `float 3s ease-in-out ${i * 0.4}s infinite` }}>{s}</span>
              ))}
            </div>
            <p className="text-white/70 text-lg mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Happy Wedding</p>
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
            <p className="text-center text-amber-300/80 text-sm font-medium mb-5 tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              Share your wishes &amp; prayers
            </p>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Enter your full name..."
                  className={`form-input ${touched.name && !name.trim() ? 'error' : ''}`}
                  autoComplete="name" />
                {touched.name && !name.trim() && <p className="mt-1 text-red-400 text-xs">Name is required.</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Message <span className="text-rose-400">*</span>
                </label>
                <textarea value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  placeholder="Write your message here..."
                  rows={4}
                  className={`form-input resize-none ${touched.message && !message.trim() ? 'error' : ''}`} />
                {touched.message && !message.trim() && <p className="mt-1 text-red-400 text-xs">Message is required.</p>}
              </div>

              {/* Photo */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">
                  Photo <span className="text-white/40 text-xs font-normal">(Optional — any size)</span>
                </label>

                {compressing && (
                  <div className="w-full border-2 border-amber-400/40 rounded-xl p-6 text-center bg-amber-400/5">
                    <div className="flex items-center justify-center gap-2 text-amber-300">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Compressing photo...</span>
                    </div>
                  </div>
                )}

                {!compressing && !photoPreview && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-amber-400/50 hover:bg-white/5 transition-all duration-200 group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                    <p className="text-white/50 text-sm">Tap to add a photo</p>
                    <p className="text-white/30 text-xs mt-1">Any size — auto compressed</p>
                  </button>
                )}

                {!compressing && photoPreview && (
                  <div>
                    <div className="relative rounded-xl overflow-hidden">
                      <Image src={photoPreview} alt="Preview" width={400} height={300}
                        className="w-full h-48 object-cover rounded-xl" unoptimized />
                      <button type="button" onClick={removePhoto}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
                        aria-label="Remove photo">✕</button>
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoChange} className="hidden" aria-label="Upload photo" />

                {photoError && (
                  <div className="mt-2 bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-300 text-xs">
                    {photoError}
                  </div>
                )}
              </div>

              {/* Error */}
              {formState === 'error' && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-300 text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={formState === 'submitting' || compressing}
                className="btn-primary bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 mt-2">
                {formState === 'submitting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : compressing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Compressing...
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
