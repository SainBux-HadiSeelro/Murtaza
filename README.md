# 💍 Wedding Guest Message & Live Slideshow System

> **Murtaza & Family Wedding Guestbook & Slideshow Application**  
> An interactive real-time digital guestbook for wedding events (Shadi & Walima) with instant photo uploads, admin moderation, and high-definition live venue slideshow displays.

**Live URL:** [https://murtaza-snowy.vercel.app](https://murtaza-snowy.vercel.app)

---

## ✨ Features

- 📱 **Mobile-Friendly Guest Portal (`/` & `/form/[event]`)**
  - QR-code scan & open directly on guests' smartphones.
  - Dua / congratulations message input supporting English & Urdu Nastaliq script.
  - Automatic client-side photo compression (HTML5 Canvas down to ~300KB) to ensure instant uploads even over crowded venue cellular networks.
  - Festive Islamic & wedding visual aesthetics with celebratory confirmations.

- 🛡️ **Organizer Moderation Panel (`/admin`)**
  - Password-protected management dashboard.
  - Tabbed overview for multiple wedding functions (`Shadi`, `Walima`).
  - Real-time approval workflow (**Approve**, **Reject**, **Delete**).
  - Photo visibility switch (show text only or text + photo in slideshow).
  - Lightweight bandwidth-saving list with on-demand photo modal previews.
  - Integrated QR Code Generator with one-click PNG download for event standees and table cards.

- 📺 **Live Venue Slideshow (`/slideshow/[event]`)**
  - Full-screen optimized for venue projectors, LED walls, and TVs (`F11` compatible).
  - Password-protected display interface.
  - Auto-rotates approved guest messages every 5 seconds with smooth cinematic transitions.
  - Displays guest portrait with gold glow, gold shimmer headings, and authentic Urdu calligraphy typography.
  - Background live polling (every 15s) automatically fetches newly approved wishes without interrupting the screen.

---

## 🗂️ Project Structure

```
wedding-guest-system/
├── pages/
│   ├── _app.tsx              # Application wrapper + global toast alerts
│   ├── _document.tsx         # Document head with Google Fonts (Playfair, Noto Nastaliq Urdu)
│   ├── index.tsx             # Main guest submission page
│   ├── form/
│   │   └── [event].tsx       # Dynamic event guest form (/form/shadi, /form/walima)
│   ├── admin/
│   │   └── index.tsx         # Password-protected admin dashboard
│   ├── slideshow/
│   │   └── [event].tsx       # Fullscreen auto-rotating slideshow
│   └── api/
│       ├── entries/
│       │   ├── index.ts      # GET / POST guest entries
│       │   ├── [id].ts       # PATCH (status/showPhoto) & DELETE entry
│       │   └── photo/
│       │       └── [id].ts   # On-demand photo URL retrieval
│       └── debug.ts          # Environment and connection health check
├── lib/
│   ├── api.ts                # Client API methods (addGuestEntry, fetchApprovedEntries, etc.)
│   ├── cloudinary.ts         # Server-side Cloudinary photo upload & optimization
│   ├── imageUtils.ts         # Client-side canvas image compressor (1200px / 300KB)
│   ├── supabase.ts           # Supabase client initialization
│   ├── types.ts              # TypeScript definitions
│   └── validation.ts         # Input & phone validation utilities
├── scripts/
│   ├── add-photo-size-columns.js # Supabase schema reference migration script
│   ├── fix-env.js            # Environment helper script
│   └── set-env-now.js        # Vercel env automated setup & redeploy script
├── styles/
│   └── globals.css           # Tailwind directives & luxury gold shimmer styles
├── SPECS.md                  # Detailed system specifications
├── package.json              # Project dependencies and npm scripts
└── README.md                 # Project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (Pages Router) |
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Media / Storage** | Cloudinary CDN |
| **QR Code Engine** | `qrcode` |
| **Toast Alerts** | `react-hot-toast` |
| **Typography** | Playfair Display, Noto Nastaliq Urdu, Inter |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.x or v20.x
- **npm** or **yarn** / **pnpm**
- A free [Supabase](https://supabase.com) account
- A free [Cloudinary](https://cloudinary.com) account

### 2. Clone & Install Dependencies

```bash
git clone <repo-url>
cd MURTAZA
npm install
```

### 3. Database Setup (Supabase)

1. Create a project at [database.new](https://database.new) (Supabase).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the following table initialization script:

```sql
CREATE TABLE IF NOT EXISTS guest_entries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  message TEXT NOT NULL,
  photo_url TEXT,
  event TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  show_photo BOOLEAN DEFAULT true,
  timestamp BIGINT NOT NULL,
  original_photo_kb INTEGER,
  compressed_photo_kb INTEGER
);

-- Index for instant querying by the slideshow and admin panel
CREATE INDEX IF NOT EXISTS idx_guest_entries_event_status_timestamp
ON guest_entries (event, status, timestamp ASC);
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# ── Supabase Configuration ───────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ── Cloudinary Configuration ─────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Access Passwords ──────────────────────────────────────────────────────────
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
NEXT_PUBLIC_SLIDESHOW_PASSWORD=your_slideshow_password

# ── Application URL (Used for QR codes) ───────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Venue Operations Guide

### A. Reception & Guest Tables
1. Go to `/admin` and log in with your admin password.
2. Click **📱 QR Code** to view and download the high-resolution PNG.
3. Print the QR codes on tabletop stands or banner posters.
4. Guests point their smartphone cameras at the QR code and are instantly taken to `https://murtaza-snowy.vercel.app`.

### B. Organizer Moderation
1. Keep `/admin` open on a laptop or tablet connected to Wi-Fi.
2. New guest messages appear under the **Pending** tab.
3. Review the text and click **Approve** to send it directly to the live screens.
4. If a guest uploaded a photo that is blurry or private, toggle off **Show Photo** so only their blessing appears.

### C. Venue Projection Screens / TVs
1. Open the slideshow URL on the connected TV/projector laptop:
   - For Shadi: `https://murtaza-snowy.vercel.app/slideshow/shadi`
   - For Walima: `https://murtaza-snowy.vercel.app/slideshow/walima`
2. Enter the slideshow access password.
3. Press **F11** (Windows/Linux) or **Cmd + Ctrl + F** (Mac) to switch to borderless fullscreen.
4. The slideshow will continuously cycle through all approved entries.

---

## 🚢 Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Under **Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SLIDESHOW_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` (Set to `https://murtaza-snowy.vercel.app` or your custom domain)

4. Deploy!

---

## 📄 License & Credits

Designed with ❤️ for Murtaza & Family's wedding celebration.