# 📋 System Specifications: Wedding Guest Message & Slideshow System

**Project Name:** Murtaza & Family Wedding Guestbook & Live Slideshow  
**Version:** 1.0.0  
**Stack:** Next.js 14 (Pages Router) · React 18 · TypeScript · Tailwind CSS · Supabase · Cloudinary  
**Production Domain:** [https://murtaza-snowy.vercel.app](https://murtaza-snowy.vercel.app)

---

## 1. Executive Summary & Objective

The **Wedding Guest Message & Slideshow System** is an interactive, digital guestbook solution designed for wedding celebrations (e.g., Shadi and Walima). The application enables attendees to scan a QR code at the event venue, submit congratulations/dua messages with optional photos, and have them approved in real time by wedding organizers via an administrative moderation dashboard. Approved wishes are dynamically showcased on venue screens and projectors via an automated, aesthetically styled full-screen slideshow.

---

## 2. Architecture & Technology Stack

### 2.1 Architecture Overview
The system follows a modern serverless web architecture utilizing Next.js API routes as a lightweight backend proxying data between client devices, a PostgreSQL database (Supabase), and a media CDN (Cloudinary).

```
                     ┌────────────────────────┐
                     │     Guest Mobile       │
                     │  (Scan QR / Form Page) │
                     └───────────┬────────────┘
                                 │ HTTP POST (Base64 compressed photo + text)
                                 ▼
┌─────────────────┐  HTTP GET   ┌────────────────────────┐   Admin Actions   ┌─────────────────┐
│ Live Slideshow  │ ◄───────────┤   Next.js API Routes   ├──────────────────►│   Admin Panel   │
│ (Screen / F11)  │  (Polling)  │    (/api/entries)      │  (Approve/Reject) │ (/admin Laptop) │
└─────────────────┘             └───┬────────────────┬───┘                   └─────────────────┘
                                    │                │
            JSON / Metadata Storage │                │ Image Upload & Optimization
                                    ▼                ▼
                       ┌─────────────────┐      ┌─────────────────┐
                       │    Supabase     │      │   Cloudinary    │
                       │   (PostgreSQL)  │      │     (Media)     │
                       └─────────────────┘      └─────────────────┘
```

### 2.2 Core Technologies

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (Pages Router) + React 18 | SSR/SSG flexibility, fast routing, and serverless API routes. |
| **Language** | TypeScript 5 | Strict typing across API payloads, database models, and components. |
| **Styling** | Tailwind CSS + Custom CSS Keyframes | Rapid UI development, glassmorphic cards, gold shimmers, and responsive grids. |
| **Typography** | Google Fonts (`Playfair Display`, `Noto Nastaliq Urdu`, `Inter`) | Elegant South Asian wedding aesthetic with full Urdu calligraphy support. |
| **Database** | Supabase (PostgreSQL) | Scalable managed SQL database with fast RESTful querying and indexing. |
| **Media Storage** | Cloudinary | Auto-format (`f_auto`), quality compression (`q_auto:good`), and CDN delivery. |
| **QR Code Engine** | `qrcode` | Client-side & admin vector/raster QR code generation. |
| **Toast Alerts** | `react-hot-toast` | Non-blocking user feedback for submissions and administrative actions. |

---

## 3. Database Specification (Supabase)

### 3.1 Table: `guest_entries`

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `NO` | - | Unique alphanumeric primary key (timestamp + random base36). |
| `name` | `TEXT` | `NO` | - | Full name of the wedding guest. |
| `phone` | `TEXT` | `YES` | `''` | Contact number (optional / sanitized). |
| `message` | `TEXT` | `NO` | - | Congratulations / Dua text (supports English and Urdu). |
| `photo_url` | `TEXT` | `YES` | `NULL` | Secure Cloudinary CDN URL of the uploaded image. |
| `event` | `TEXT` | `NO` | `'shadi'` | Event identifier (e.g., `'shadi'`, `'walima'`). |
| `status` | `TEXT` | `NO` | `'pending'` | Moderation status: `'pending'`, `'approved'`, `'rejected'`. |
| `show_photo` | `BOOLEAN` | `NO` | `true` | Admin toggle to display/hide guest photo in the slideshow. |
| `timestamp` | `BIGINT` | `NO` | - | Unix timestamp (milliseconds) of submission. |
| `original_photo_kb` | `INTEGER` | `YES` | `NULL` | Pre-compression file size in kilobytes. |
| `compressed_photo_kb` | `INTEGER` | `YES` | `NULL` | Post-canvas compression file size before upload. |

### 3.2 SQL Schema & Indexing

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

-- Composite index for slideshow querying & real-time polling
CREATE INDEX IF NOT EXISTS idx_guest_entries_event_status_timestamp
ON guest_entries (event, status, timestamp ASC);
```

---

## 4. API Endpoints Specification

All endpoints are built using Next.js Serverless API routes and parse payloads up to 15MB.

### 4.1 `GET /api/entries`
Retrieves guest entries filtered by event and status.

- **Query Parameters:**
  - `event` (optional): `'shadi' | 'walima'`
  - `status` (optional): `'pending' | 'approved' | 'rejected'`
  - `full` (optional): `'1'` to return full `photo_url`; otherwise returns `'__has_photo__'` flag to preserve bandwidth in the admin list.
  - `page` (optional): Index offset for fetching single slide photos.
- **Success Response (`200 OK`):**
  ```json
  [
    {
      "id": "m1k2l3_a89bc",
      "name": "Ahmed Khan",
      "phone": "",
      "message": "Shadi Mubarak! Wishing you a blessed life ahead.",
      "photoUrl": "https://res.cloudinary.com/.../wedding/m1k2l3_a89bc.jpg",
      "event": "shadi",
      "status": "approved",
      "showPhoto": true,
      "timestamp": 1715900000000,
      "originalPhotoKB": 2450,
      "compressedPhotoKB": 185
    }
  ]
  ```

### 4.2 `POST /api/entries`
Submits a new guest entry with optional Base64 photo payload.

- **Request Body:**
  ```json
  {
    "name": "Fatima & Family",
    "message": "بہت بہت مبارک ہو! اللہ ہمیشہ خوش رکھے",
    "photoUrl": "data:image/jpeg;base64,...",
    "event": "shadi",
    "originalPhotoKB": 3200,
    "compressedPhotoKB": 210
  }
  ```
- **Process Flow:**
  1. Validates `name`, `message`, and `event`.
  2. Generates unique record ID.
  3. If `photoUrl` is a Base64 data URL, invokes `uploadBase64Photo()` to Cloudinary under folder `wedding/`.
  4. Inserts row into Supabase `guest_entries` with default status `'pending'`.
  5. Returns created entry with HTTP `201 Created`.

### 4.3 `PATCH /api/entries/[id]`
Updates entry moderation status or photo display preference.

- **Path Parameter:** `id` (Record ID)
- **Request Body (Partial):**
  ```json
  {
    "status": "approved",
    "showPhoto": true
  }
  ```
- **Success Response:** `200 OK` with updated record object.

### 4.4 `DELETE /api/entries/[id]`
Permanently removes a guest entry from Supabase.

- **Success Response:** `200 OK` (`{ "success": true }`).

### 4.5 `GET /api/entries/photo/[id]`
On-demand fetch for entry photo URL (used by admin to preview photo without loading all gallery photos at once).

- **Success Response:** `200 OK` (`{ "photoUrl": "https://..." }`).

---

## 5. Client Modules & User Interface Specifications

### 5.1 Guest Submission Portal (`/` & `/form/[event]`)
- **Responsive Layout:** Mobile-first layout optimized for iOS Safari and Android Chrome.
- **Client-Side Canvas Compression:**
  - Automatically scales images exceeding 1200px dimension.
  - Successively steps down JPEG compression quality (0.85 -> 0.2) until file is under ~300KB.
  - Prevents network timeout and excessive upload bandwidth on venue cellular data.
- **Urdu & English Typography:** Auto text direction detection (`dir="auto"`) and responsive sizing.
- **Submission States:** Visual feedback states (`idle`, `submitting`, `success`, `error`) with retry handling.

### 5.2 Admin Moderation Dashboard (`/admin`)
- **Authentication:** Password protected using `NEXT_PUBLIC_ADMIN_PASSWORD` (cached in `sessionStorage`).
- **Live Feed Polling:** Automatically refreshes entries every 10 seconds.
- **Moderation Actions:**
  - One-click **Approve** (marks visible for slideshow) / **Reject**.
  - Photo visibility toggle (`Show/Hide Photo`) without deleting the entry.
  - Instant entry deletion.
- **QR Code Modal:** Built-in QR generator with immediate PNG download for physical table cards and entrance banners.
- **Performance Optimization:** List view strips base64/heavy photo URLs, substituting an on-demand modal preview.

### 5.3 Live Fullscreen Slideshow (`/slideshow/[event]`)
- **Venue Display Mode:** Designed for 1080p and 4K projectors/TVs; supports full screen via browser `F11`.
- **Slide Transitions:**
  - Auto-rotates approved entries every 5 seconds (configurable).
  - Smooth fade and scale CSS transitions.
- **Aesthetic Elements:**
  - Gold shimmer headings and Urdu Nastaliq blessings.
  - Circular framed guest portraits with gold glow borders.
  - Ambient floral & geometric ornamental dividers.
- **Background Refreshing:** Background polling every 15 seconds fetches newly approved entries seamlessly without interrupting the presentation.
- **Access Control:** Slideshow screen protected by `NEXT_PUBLIC_SLIDESHOW_PASSWORD`.

---

## 6. Security, Configuration & Deployment

### 6.1 Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Supabase Project API endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Supabase Public / Anon API key. |
| `CLOUDINARY_CLOUD_NAME` | Server | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | Server | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Server (Secret) | Cloudinary API Secret for authenticated uploads. |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Client / Shared | Password required to access `/admin`. |
| `NEXT_PUBLIC_SLIDESHOW_PASSWORD` | Client / Shared | Password required to open `/slideshow/*`. |
| `NEXT_PUBLIC_APP_URL` | Client | Canonical URL used for QR code generation (e.g. `https://murtaza-snowy.vercel.app`). |

### 6.2 Security Best Practices
- Supabase table access controlled with API-level validation.
- Cloudinary secret is restricted to serverless API routes (`pages/api/`) and is never leaked to client bundles.
- Body parser set to 15MB ceiling to prevent denial-of-service memory pressure.
