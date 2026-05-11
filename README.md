# 💍 Wedding Guest Message & Slideshow System

A complete two-event (Shadi + Walima) wedding guest management system with:
- **Guest submission forms** (mobile-friendly, QR-code accessible)
- **Admin panel** (password-protected, approve/reject entries)
- **Live slideshows** (fullscreen, auto-rotating, real-time updates)

---

## 🗂 Project Structure

```
wedding-guest-system/
├── pages/
│   ├── _app.tsx              # App wrapper + toast notifications
│   ├── _document.tsx         # HTML head (Google Fonts)
│   ├── index.tsx             # Home / navigation page
│   ├── form/
│   │   └── [event].tsx       # Guest form (/form/shadi, /form/walima)
│   ├── admin/
│   │   └── index.tsx         # Admin panel (/admin)
│   └── slideshow/
│       └── [event].tsx       # Slideshow (/slideshow/shadi, /slideshow/walima)
├── lib/
│   ├── firebase.ts           # Firebase app initialization
│   ├── firestore.ts          # All Firestore + Storage operations
│   ├── types.ts              # TypeScript types
│   └── validation.ts         # Pakistani phone number validation
├── styles/
│   └── globals.css           # Tailwind + custom animations
├── firestore.rules           # Firestore security rules
├── storage.rules             # Firebase Storage security rules
├── .env.local.example        # Environment variable template
└── README.md
```

---

## ⚙️ Setup Instructions

### Step 1 — Install Dependencies

```bash
npm install
```

### Step 2 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it (e.g. `wedding-2024`)
3. Disable Google Analytics (optional) → **Create project**

### Step 3 — Enable Firestore

1. In Firebase Console → **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you'll apply proper rules later)
4. Select a region close to Pakistan (e.g. `asia-south1`)

### Step 4 — Enable Firebase Storage

1. In Firebase Console → **Build → Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Same region as Firestore

### Step 5 — Get Firebase Config

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **</>** (Web)
3. Register app (name it anything)
4. Copy the `firebaseConfig` object values

### Step 6 — Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_ADMIN_PASSWORD=YourSecurePassword123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 7 — Apply Security Rules

In Firebase Console:

**Firestore Rules** → paste contents of `firestore.rules` → Publish

**Storage Rules** → paste contents of `storage.rules` → Publish

### Step 8 — Create Firestore Index

The app queries entries by `event` + `status` ordered by `timestamp`.
Firebase will prompt you to create the index when you first run the app —
click the link in the browser console error, or create it manually:

1. Firestore → **Indexes** → **Add index**
2. Collection: `guestEntries`
3. Fields: `event ASC`, `status ASC`, `timestamp ASC`

### Step 9 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment (Vercel — Recommended)

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add all your `NEXT_PUBLIC_*` values.

### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add environment variables in **Settings → Environment Variables**
5. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://wedding-2024.vercel.app`)
6. Deploy!

### After Deployment

Update `.env.local` (and Vercel env vars) with your production URL:
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 📱 QR Code Generation & Printing

### How to Generate QR Codes

1. Open the **Admin Panel** at `/admin`
2. Log in with your admin password
3. Click the **📱 QR Code** button in either the Shadi or Walima tab
4. A QR code modal appears with the form URL
5. Click **⬇ Download** to save the PNG

### What the QR Codes Link To

| Event  | URL                                    |
|--------|----------------------------------------|
| Shadi  | `https://your-app.vercel.app/form/shadi`  |
| Walima | `https://your-app.vercel.app/form/walima` |

### Printing Tips

- Print on **A4 or A5** paper — the QR code is 300×300px, scale up as needed
- Add a decorative border and event name around the QR code in Canva or Word
- Laminate for durability at the venue
- Place at the entrance, on tables, and with the volunteer scanner

---

## 🖥 Venue Setup

### Guest Form (Volunteer's Device)
- Open `/form/shadi` or `/form/walima` on a tablet/phone
- Or let guests scan the QR code with their own phones

### Admin Panel (Organizer's Device)
- Open `/admin` on a laptop or tablet
- Log in and keep this open throughout the event
- Approve messages as they come in

### Slideshow Screens (Venue TVs/Projectors)
- Open `/slideshow/shadi` on the Shadi hall screen
- Open `/slideshow/walima` on the Walima hall screen
- Press **F11** for fullscreen in Chrome/Edge
- The slideshow auto-rotates every 8 seconds
- New approved entries appear automatically (no refresh needed)

---

## 🔧 Customization

### Change Slide Duration
In `pages/slideshow/[event].tsx`, find:
```ts
const SLIDE_DURATION = 8000; // 8 seconds per slide
```
Change to any value in milliseconds.

### Change Admin Password
Update `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local` (and Vercel env vars).

### Change Colors / Theme
Edit `styles/globals.css` and the `EVENT_CONFIG` objects in form and slideshow pages.

### Add More Events
1. Update `EventType` in `lib/types.ts` to add new event names
2. Add config entries in `EVENT_CONFIG` in form and slideshow pages
3. Add new routes in `pages/form/[event].tsx` and `pages/slideshow/[event].tsx`

---

## 📋 Data Schema

Each guest entry in Firestore (`guestEntries` collection):

```typescript
{
  id: string;           // Auto-generated Firestore ID
  name: string;         // Guest's full name
  phone: string;        // Pakistani phone number
  message: string;      // Dua / wish message
  photoUrl: string | null;  // Firebase Storage URL (null if no photo)
  event: 'shadi' | 'walima';
  status: 'pending' | 'approved' | 'rejected';
  showPhoto: boolean;   // Admin toggle for photo visibility on slideshow
  timestamp: number;    // Unix milliseconds
}
```

---

## 🔐 Security Notes

- The admin password is stored in an environment variable and checked client-side. For a production system with sensitive data, consider adding Firebase Authentication.
- Firestore rules allow public reads (needed for slideshow). If you want to restrict this, add Firebase Auth to the admin and slideshow pages.
- Never commit `.env.local` to version control.

---

## 🐛 Troubleshooting

**"Missing or insufficient permissions" error**
→ Check your Firestore and Storage rules are published correctly.

**Photos not uploading**
→ Verify `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is correct (should end in `.appspot.com`).

**Slideshow not updating**
→ Check browser console for Firestore index errors. Create the composite index as prompted.

**QR code shows wrong URL**
→ Make sure `NEXT_PUBLIC_APP_URL` is set to your deployed URL (not localhost) in production.

**Urdu text not rendering correctly**
→ Ensure Google Fonts (Noto Nastaliq Urdu) is loading. Check network tab for font requests.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| File Storage | Firebase Storage |
| QR Codes | `qrcode` npm package |
| Notifications | `react-hot-toast` |
| Fonts | Google Fonts (Playfair Display, Noto Nastaliq Urdu, Inter) |
| Deployment | Vercel (recommended) |

---

Made with ❤️ for a beautiful occasion. Mubarak ho! 🎊
