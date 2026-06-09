# GlimSync - Complete Project Documentation 📸

This is the all-in-one documentation for **GlimSync**, an AI-powered event media management platform.

---

## 📋 Table of Contents
1. [Overview & Implemented Deliverables](#1-overview--implemented-deliverables)
2. [Tech Stack](#2-tech-stack)
3. [Architecture & Flow](#3-architecture--flow)
4. [Database Schema & ERD](#4-database-schema--erd)
5. [Local Setup & Deployment](#5-local-setup--deployment)

---

## 1. Overview & Implemented Deliverables

**GlimSync** is a cutting-edge, AI-powered platform designed for photographers and event organizers to effortlessly manage event media, auto-tag guests using facial recognition, and automatically generate smart captions and tags for photos using advanced AI models.

### 📦 Implemented Deliverables & Changes Log
Below is the log of specialized layout fixes, UI improvements, AI features, and backend services implemented:

- **Branding Color Split:**
  - Separated the navbar logo text `"GlimSync"` into **Glim** (dark navy blue: `#1e3a8a`) and **Sync** (solid black: `#000000`).
- **Navbar Layout Fix:**
  - Corrected active session state handling in `layout.tsx` to prevent overlapping login/register buttons when a user is already authenticated. The navbar now shows *only* the user profile badge when logged in.
- **4-Column Responsive Layout:**
  - Re-engineered the media query breakpoints across all galleries (Gallery Feed, Downloads, Tagged, and Favorites) to trigger 4 columns starting at viewport widths of `768px`/`800px` (guaranteeing 4 columns even under high-DPI Windows display scaling).
- **Zoomed Out Grid Aesthetic:**
  - Shrunk gallery card image height from `280px` to `200px`/`210px` to create a polished, clean, and zoomed-out grid visual structure.
- **Star Icon Repositioning:**
  - Moved the favorite star icon from the top overlay down to the bottom actions bar on gallery cards next to the comment and like buttons.
- **Folder and Event Actions:**
  - Added functional delete and download capability for folders/events, restricting deleting actions strictly to the uploader.
- **Robust Watermarking:**
  - Built SVG watermarking compatible with Node.js environments on Vercel by avoiding complex custom filters/gradients and using system-compatible Arial fonts.
- **Admin Dashboard Integration:**
  - Registered and seeded an admin account (`admin@glimsync.com` / `adminpassword123`) directly connected to the database to access `/admin`.

---

## 2. Tech Stack

- **Frontend:** Next.js 14, React 19, Tailwind CSS (Vanilla CSS structure), Lucide Icons
- **Backend:** Next.js App Router (API Routes)
- **Database:** MySQL, Prisma ORM
- **Authentication:** NextAuth.js (Credentials/Session based)
- **AI & ML:** 
  - `@vladmandic/face-api` (Client-side Facial Recognition)
  - `@google/generative-ai` (Gemini Pro Vision for image analysis)
- **Storage:** Cloudinary

---

## 3. Architecture & Flow

Below is the visual block diagram representing the system flow from the client application down to the backend APIs, database, storage, and AI processing layers.

```mermaid
graph TD
    Client["Client (Next.js/React)"]
    Auth["Authentication (NextAuth)"]
    DB[(Database - MySQL / Prisma)]
    Storage["Cloudinary (Media Storage)"]
    AI_Face["Face Recognition (face-api.js)"]
    AI_Vision["AI Vision Analysis (Google Gemini)"]

    Client -->|Login / Session| Auth
    Auth --> DB
    Client -->|Upload Images| Storage
    Client -->|Detect Faces locally| AI_Face
    Client -->|Analyze Media for Captions| AI_Vision
    AI_Vision -.->|Tags & Captions| DB
    Storage -.->|Image URLs| DB
    Client -->|Read/Write Data| DB
```

### Component Breakdown
- **Client Layer:** Next.js frontend running client-side facial recognition (`face-api.js`) to offload detection and ensure low latency.
- **Auth Layer:** Secure sessions via `NextAuth.js` verifying user records.
- **AI Vision:** Gemini Pro Vision is queried to analyze uploaded media and generate captions/tags dynamically.
- **Storage:** Cloudinary handles secure upload, processing, and media hosting.

---

## 4. Database Schema & ERD

The database is designed using Prisma ORM with MySQL. Below is an Entity-Relationship (ER) representation of the core schema:

```mermaid
erDiagram
    USER ||--o{ EVENT : creates
    USER ||--o{ MEDIA : uploads
    USER ||--o{ COMMENT : writes
    USER ||--o{ LIKE : gives
    USER ||--o{ FAVORITE : saves
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ USER_TAG : tagged_in
    
    EVENT ||--o{ MEDIA : contains
    EVENT ||--o{ FOLDER : has
    
    FOLDER ||--o{ MEDIA : groups
    
    MEDIA ||--o{ MEDIA_TAG : tagged_with
    MEDIA ||--o{ COMMENT : has
    MEDIA ||--o{ LIKE : has
    MEDIA ||--o{ FAVORITE : saved_as
    MEDIA ||--o{ USER_TAG : includes_users
    
    TAG ||--o{ MEDIA_TAG : applies_to

    USER {
        string id PK
        string name
        string email
        string role
        string faceEncodingId
    }
    EVENT {
        string id PK
        string name
        datetime date
        boolean isPrivate
    }
    MEDIA {
        string id PK
        string s3Url
        datetime uploadDate
        json metadata
    }
    COMMENT {
        string id PK
        string content
        datetime createdAt
    }
```

### Schema Details:
- **User:** Manages accounts, roles (`ADMIN`, `PHOTOGRAPHER`, `VIEWER`), and stores facial recognition profiles (`faceEncodingId`).
- **Event:** Groups media albums under specific names, dates, and privacy scopes.
- **Media:** Holds the main references for uploaded image files, along with description strings generated by Gemini.
- **UserTag / MediaTag:** Facilitates the keyword tags and face tags respectively.

---

## 5. Local Setup & Deployment

### 1. Installation
```bash
git clone https://github.com/chanchal624/event-management-Glimsync-CIG.git
cd event-management-Glimsync-CIG
npm install
```

### 2. Environment Setup (`.env`)
Create a `.env` file in the root directory:
```env
DATABASE_URL="mysql://username:password@localhost:3306/glimsync_db"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
GEMINI_API_KEY="your_google_gemini_api_key"
```

### 3. Database Initialization
```bash
npx prisma generate
npx prisma db push
```

### 4. Running Locally
```bash
npm run dev
```

### 🚀 Production Deployment (Vercel)
1. Add the environment variables inside your Vercel Project settings.
2. Ensure the Build Command runs: `prisma generate && next build`.
3. Set the production URL (`NEXTAUTH_URL`) to your deployed domain: `https://event-management-glimsync-cig.vercel.app`.
