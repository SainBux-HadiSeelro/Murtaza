import { useState, useEffect, useRef, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { fetchApprovedEntries } from '@/lib/api';
import type { EventType, GuestEntry } from '@/lib/types';

interface Props { event: EventType; }

const SLIDE_DURATION = 5000;  // 5 seconds per slide
const POLL_INTERVAL  = 6000;  // ms between refreshes
const SLIDESHOW_PASSWORD = process.env.NEXT_PUBLIC_SLIDESHOW_PASSWORD || 'murtazaslideshow12';

const EVENT_CONFIG = {
  shadi: {
    title: 'Shadi Mubarak',
    urduTitle: 'شادی مبارک',
    emoji: '🌸',
    accentColor: '#fda4af',
    secondaryColor: '#fcd34d',
    bg: 'linear-gradient(160deg, #1a0000 0%, #3d0000 35%, #5c0000 65%, #2a0000 100%)',
  },
  walima: {
    title: 'Walima Mubarak',
    urduTitle: 'ولیمہ مبارک',
    emoji: '🌹',
    accentColor: '#fcd34d',
    secondaryColor: '#fda4af',
    bg: 'linear-gradient(160deg, #1a0000 0%, #3d0000 35%, #5c0000 65%, #2a0000 100%)',
  },
};

// ─── Slideshow Login Screen ───────────────────────────────────────────────────
function SlideshowLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === SLIDESHOW_PASSWORD) {
      sessionStorage.setItem('slideshow_auth', '1');
      onLogin();
    } else {
      setError('Wrong password. Try again.');
      setPw('');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a2e 40%, #0d0d1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '1.25rem',
        padding: '2.5rem',
        width: '100%', maxWidth: '360px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.6rem', fontWeight: 700,
          background: 'linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1.5rem',
        }}>Slideshow Access</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(''); }}
            placeholder="Enter password..."
            autoFocus
            style={{
              width: '100%', padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontSize: '1rem',
              outline: 'none',
            }}
          />
          {error && <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>}
          <button type="submit" style={{
            padding: '0.85rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: 'white', fontWeight: 600, fontSize: '1rem',
            border: 'none', cursor: 'pointer',
          }}>
            Enter Slideshow
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Ornament ─────────────────────────────────────────────────────────────────
function Ornament({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '16px 0' }}>
      <div style={{ height: '1px', flex: 1, maxWidth: '96px', background: `linear-gradient(to right, transparent, ${color})` }} />
      <span style={{ color, fontSize: '1.1rem' }}>✦</span>
      <span style={{ color, fontSize: '1.4rem' }}>❋</span>
      <span style={{ color, fontSize: '1.1rem' }}>✦</span>
      <div style={{ height: '1px', flex: 1, maxWidth: '96px', background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  );
}

// ─── Single Slide ─────────────────────────────────────────────────────────────
function Slide({
  entry,
  accentColor,
  secondaryColor,
  isVisible,
}: {
  entry: GuestEntry;
  accentColor: string;
  secondaryColor: string;
  isVisible: boolean;
}) {
  const showPhoto = !!(entry.photoUrl && entry.showPhoto);
  const isUrdu = /[\u0600-\u06FF]/.test(entry.message);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        transition: 'opacity 1s ease, transform 1s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>

        {/* Photo */}
        {showPhoto && (
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.photoUrl!}
              alt={entry.name}
              style={{
                width: 'min(200px, 28vw)',
                height: 'min(200px, 28vw)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${accentColor}`,
                boxShadow: `0 0 40px ${accentColor}50`,
              }}
            />
          </div>
        )}

        {/* Name */}
        <h2
          style={{
            fontFamily: 'Playfair Display, serif',
            color: accentColor,
            fontSize: 'clamp(2rem, 5vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '0.5rem',
            textShadow: `0 0 30px ${accentColor}60`,
          }}
        >
          {entry.name}
        </h2>

        <Ornament color={secondaryColor} />

        {/* Message */}
        <p
          dir="auto"
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)',
            fontFamily: isUrdu ? 'Noto Nastaliq Urdu, serif' : 'Playfair Display, serif',
            lineHeight: isUrdu ? 2.2 : 1.8,
            maxWidth: '680px',
            margin: '0 auto',
            fontWeight: 300,
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          &ldquo;{entry.message}&rdquo;
        </p>
      </div>
    </div>
  );
}

// ─── Waiting Screen ───────────────────────────────────────────────────────────
function WaitingScreen({ cfg }: { cfg: typeof EVENT_CONFIG['shadi'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.5))' }}>
        {cfg.emoji}
      </div>
      <h1
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 700,
          marginBottom: '0.75rem',
          background: 'linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 3s linear infinite',
        }}
      >
        {cfg.urduTitle}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontFamily: 'Playfair Display, serif' }}>
        {cfg.title} — Guest Messages
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {[0, 150, 300].map((d) => (
          <div
            key={d}
            style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'rgba(251,191,36,0.5)',
              animation: `bounce 1s ${d}ms infinite`,
            }}
          />
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', marginTop: '1rem' }}>
        Waiting for approved messages...
      </p>
    </div>
  );
}

// ─── Main Slideshow ───────────────────────────────────────────────────────────
export default function SlideshowPage({ event }: Props) {
  const cfg = EVENT_CONFIG[event];
  const [authed, setAuthed]             = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [entries, setEntries]           = useState<GuestEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressKey, setProgressKey]   = useState(0);

  // Keep latest entries count in a ref so timer always sees fresh value
  const entriesRef   = useRef<GuestEntry[]>([]);
  const slideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth check on mount
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('slideshow_auth') === '1') setAuthed(true);
  }, []);

  // ── Fetch approved entries ──────────────────────────────────────────────────
  const loadEntries = useCallback(async () => {
    try {
      const data = await fetchApprovedEntries(event);
      entriesRef.current = data;
      setEntries(data);
    } catch (e) {
      console.error('Slideshow fetch error', e);
    }
  }, [event]);

  useEffect(() => {
    loadEntries();
    pollTimer.current = setInterval(loadEntries, POLL_INTERVAL);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [loadEntries]);

  // ── Auto-advance — uses ref so no stale closure ─────────────────────────────
  const scheduleNext = useCallback(() => {
    if (slideTimer.current) clearTimeout(slideTimer.current);
    slideTimer.current = setTimeout(() => {
      const len = entriesRef.current.length;
      if (len === 0) { scheduleNext(); return; }
      setCurrentIndex((prev) => (prev + 1) % len);
      setProgressKey((k) => k + 1);   // restart progress bar
      scheduleNext();                  // schedule the next one
    }, SLIDE_DURATION);
  }, []);

  // Start the loop once on mount, clean up on unmount
  useEffect(() => {
    scheduleNext();
    return () => { if (slideTimer.current) clearTimeout(slideTimer.current); };
  }, [scheduleNext]);

  // Reset to slide 0 when new entries arrive and current index is out of range
  useEffect(() => {
    if (entries.length > 0 && currentIndex >= entries.length) {
      setCurrentIndex(0);
      setProgressKey((k) => k + 1);
    }
  }, [entries.length, currentIndex]);

  const pageTitle = `${cfg.title} — Live Slideshow`;

  // Show nothing until mounted (avoid SSR mismatch)
  if (!mounted) return null;
  // Show login if not authenticated
  if (!authed) return <SlideshowLogin onLogin={() => setAuthed(true)} />;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-8px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%       { transform: translateY(-12px) rotate(3deg); }
          }
          @keyframes floatCouple {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-18px) scale(1.04); }
          }
          @keyframes floatHeart {
            0%, 100% { transform: translateY(0px) scale(1) rotate(-5deg); }
            50%       { transform: translateY(-22px) scale(1.15) rotate(5deg); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.18; transform: scale(1); }
            50%       { opacity: 0.32; transform: scale(1.12); }
          }
          @keyframes rotateSlow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes progressFill {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50%       { opacity: 1;   transform: scale(1.2); }
          }
          @keyframes petalFall {
            0%   { transform: translateY(-60px) rotate(0deg);   opacity: 0;   }
            10%  { opacity: 0.6; }
            90%  { opacity: 0.4; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0;   }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { overflow: hidden; background: #0d0d1a; }
        `}</style>
      </Head>

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: cfg.bg }}>

        {/* Glow blobs — subtle warm on charcoal */}
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.accentColor}18, transparent)`,
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '20%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.secondaryColor}12, transparent)`,
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        {/* ── Floating Rose Petals ── */}
        {[
          { left:'8%',  animDur:'7s',  delay:'0s',   size:'2rem',  emoji:'🌸' },
          { left:'18%', animDur:'9s',  delay:'1.5s', size:'1.4rem',emoji:'🌹' },
          { left:'30%', animDur:'6s',  delay:'0.8s', size:'1.8rem',emoji:'🌸' },
          { left:'45%', animDur:'11s', delay:'2s',   size:'1.2rem',emoji:'🌺' },
          { left:'58%', animDur:'8s',  delay:'0.3s', size:'2rem',  emoji:'🌸' },
          { left:'70%', animDur:'7s',  delay:'1.2s', size:'1.5rem',emoji:'🌹' },
          { left:'82%', animDur:'10s', delay:'0.6s', size:'1.8rem',emoji:'🌸' },
          { left:'92%', animDur:'6s',  delay:'1.8s', size:'1.3rem',emoji:'🌺' },
          { left:'25%', animDur:'8s',  delay:'3s',   size:'1.1rem',emoji:'🌸' },
          { left:'65%', animDur:'9s',  delay:'2.5s', size:'1.6rem',emoji:'🌹' },
          { left:'50%', animDur:'7s',  delay:'4s',   size:'1.2rem',emoji:'🌸' },
          { left:'38%', animDur:'11s', delay:'1s',   size:'1.4rem',emoji:'🌺' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: p.left,
            top: '-3rem',
            fontSize: p.size,
            opacity: 0.55,
            animation: `petalFall ${p.animDur} linear ${p.delay} infinite`,
            pointerEvents: 'none',
            filter: 'blur(0.3px)',
          }}>{p.emoji}</div>
        ))}

        {/* ── Bokeh Gold Circles ── */}
        {[
          { left:'5%',  top:'15%', size:'80px',  opacity:0.07, dur:'6s',  delay:'0s'   },
          { left:'88%', top:'10%', size:'120px', opacity:0.06, dur:'8s',  delay:'1s'   },
          { left:'15%', top:'60%', size:'60px',  opacity:0.08, dur:'5s',  delay:'2s'   },
          { left:'75%', top:'55%', size:'90px',  opacity:0.07, dur:'7s',  delay:'0.5s' },
          { left:'45%', top:'5%',  size:'70px',  opacity:0.06, dur:'9s',  delay:'1.5s' },
          { left:'60%', top:'75%', size:'100px', opacity:0.05, dur:'6s',  delay:'3s'   },
          { left:'30%', top:'80%', size:'55px',  opacity:0.08, dur:'7s',  delay:'2.5s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: b.left, top: b.top,
            width: b.size, height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cfg.accentColor}, transparent)`,
            opacity: b.opacity,
            animation: `glowPulse ${b.dur} ease-in-out ${b.delay} infinite`,
            pointerEvents: 'none',
            filter: 'blur(8px)',
          }} />
        ))}

        {/* ── Twinkling Stars ── */}
        {[
          { left:'10%', top:'20%', delay:'0s'   },
          { left:'85%', top:'25%', delay:'0.7s' },
          { left:'20%', top:'70%', delay:'1.4s' },
          { left:'78%', top:'65%', delay:'0.3s' },
          { left:'50%', top:'15%', delay:'1s'   },
          { left:'35%', top:'45%', delay:'2s'   },
          { left:'65%', top:'40%', delay:'1.7s' },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: s.left, top: s.top,
            fontSize: '0.6rem',
            color: cfg.accentColor,
            opacity: 0.6,
            animation: `twinkle 3s ease-in-out ${s.delay} infinite`,
            pointerEvents: 'none',
          }}>★</div>
        ))}

        {/* Corner emojis */}
        {[
          { top: '1rem', left: '1rem', delay: '0s' },
          { top: '1rem', right: '1rem', delay: '2s' },
        ].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', fontSize: '2rem', opacity: 0.3, animation: `float 6s ${pos.delay} ease-in-out infinite`, ...pos }}>
            {cfg.emoji}
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', fontSize: '1.5rem', opacity: 0.2, animation: 'float 6s 4s ease-in-out infinite' }}>✨</div>
        <div style={{ position: 'absolute', bottom: '2rem', right: '1rem', fontSize: '1.5rem', opacity: 0.2, animation: 'float 6s 1s ease-in-out infinite' }}>✨</div>

        {/* Event label */}
        <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <div style={{
            padding: '6px 16px', borderRadius: '999px',
            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${cfg.accentColor}40`,
            color: cfg.accentColor,
            backdropFilter: 'blur(8px)',
            fontFamily: 'Inter, sans-serif',
          }}>
            {cfg.emoji} {cfg.title}
          </div>
        </div>

        {/* Ayat — four corners */}
        {[
          { top: '1rem',    left: '1rem'  },
          { top: '1rem',    right: '1rem' },
          { bottom: '1rem', left: '1rem'  },
          { bottom: '1rem', right: '1rem' },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos, zIndex: 10,
            pointerEvents: 'none',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${cfg.accentColor}35`,
            boxShadow: `0 0 12px ${cfg.accentColor}20`,
          }}>
            {/* Top decorative line */}
            <div style={{
              height: '1px',
              background: `linear-gradient(to right, transparent, ${cfg.accentColor}80, transparent)`,
              marginBottom: '4px',
            }} />
            <p style={{
              fontFamily: 'Noto Nastaliq Urdu, serif',
              fontSize: 'clamp(0.75rem, 1.3vw, 1rem)',
              fontWeight: 700,
              color: '#fef08a',
              direction: 'rtl',
              margin: 0,
              letterSpacing: '0.03em',
              textShadow: '0 0 10px rgba(254,240,138,0.9), 0 0 20px rgba(254,240,138,0.5)',
            }}>
              ✨ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ✨
            </p>
            {/* Bottom decorative line */}
            <div style={{
              height: '1px',
              background: `linear-gradient(to right, transparent, ${cfg.accentColor}80, transparent)`,
              marginTop: '4px',
            }} />
          </div>
        ))}

        {/* Slide counter */}
        {entries.length > 0 && (
          <div style={{
            position: 'absolute', top: '1.1rem', right: '4rem', zIndex: 10,
            color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif',
          }}>
            {currentIndex + 1} / {entries.length}
          </div>
        )}

        {/* Main content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {entries.length === 0 ? (
            <WaitingScreen cfg={cfg} />
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {entries.map((entry, idx) => (
                <Slide
                  key={entry.id}
                  entry={entry}
                  accentColor={cfg.accentColor}
                  secondaryColor={cfg.secondaryColor}
                  isVisible={idx === currentIndex}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {entries.length > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)' }}>
            <div
              key={progressKey}
              style={{
                height: '100%',
                background: cfg.accentColor,
                width: '100%',
                transformOrigin: 'left',
                animation: `progressFill ${SLIDE_DURATION}ms linear forwards`,
              }}
            />
          </div>
        )}

        {/* Dot indicators */}
        {entries.length > 1 && entries.length <= 20 && (
          <div style={{
            position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '6px', alignItems: 'center',
          }}>
            {entries.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgressKey((k) => k + 1);
                }}
                style={{
                  width: idx === currentIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  background: idx === currentIndex ? cfg.accentColor : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const event = params?.event as string;
  if (event !== 'shadi' && event !== 'walima') return { notFound: true };
  return { props: { event } };
};
