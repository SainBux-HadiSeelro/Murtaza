import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Wedding Guest System</title>
        <meta name="description" content="Wedding Guest Message & Slideshow System" />
      </Head>
      <div className="bg-wedding-form flex items-center justify-center p-6 min-h-screen">
        <div className="text-center max-w-lg w-full">
          <div className="text-5xl mb-4">💍</div>
          <h1
            className="text-4xl font-bold mb-2 text-gold-shimmer"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Wedding Guest System
          </h1>
          <p className="text-white/60 mb-10 text-lg">Shadi — Guest Messages &amp; Slideshow</p>

          <div className="grid gap-4">
            <Link href="/form/shadi"
              className="glass-card p-5 text-white hover:border-amber-400/50 transition-all duration-200 hover:scale-105 block">
              <div className="text-3xl mb-2">🌸</div>
              <div className="font-semibold text-lg text-amber-300">Shadi Form</div>
              <div className="text-white/50 text-sm">Guest submission form for Shadi</div>
            </Link>

            <Link href="/admin"
              className="glass-card p-5 text-white hover:border-amber-400/50 transition-all duration-200 hover:scale-105 block">
              <div className="text-3xl mb-2">🔐</div>
              <div className="font-semibold text-lg text-amber-300">Admin Panel</div>
              <div className="text-white/50 text-sm">Manage submissions &amp; QR codes</div>
            </Link>

            <Link href="/slideshow/shadi"
              className="glass-card p-5 text-white hover:border-amber-400/50 transition-all duration-200 hover:scale-105 block">
              <div className="text-3xl mb-2">📺</div>
              <div className="font-semibold text-lg text-amber-300">Shadi Slideshow</div>
              <div className="text-white/50 text-sm">Live fullscreen slideshow</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
