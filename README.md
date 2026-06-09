# GlimSync 📸

**GlimSync** is a cutting-edge, AI-powered platform designed for photographers and event organizers to effortlessly manage event media, auto-tag guests using facial recognition, and automatically generate smart captions and tags for photos using advanced AI models.

## 🚀 Live Demo
**[Working Deployed Project / Demo](https://event-management-glimsync-cig.vercel.app/)**

---

## 📂 Project Documentation Index

To make reading and submitting the project easy, the documentation has been split into dedicated modules:

1. **[Architecture & Design Guide (ARCHITECTURE.md)](./ARCHITECTURE.md)**
   - Technical Flow Diagram
   - Key Frontend/Backend Components & Client-Side Face API description
2. **[Database Schema & ERD (DATABASE.md)](./DATABASE.md)**
   - Complete Entity-Relationship Diagram (ERD)
   - Field-by-Field explanation of tables
3. **[Setup & Installation Guide (SETUP.md)](./SETUP.md)**
   - Dependencies & Local configuration (`.env` file)
   - Database sync & local server execution instructions
   - Vercel Deployment steps

---

## ✨ Key Features
- **Smart Auto-Tagging:** Automatically detects and tags guests in photos using client-side facial recognition (`face-api.js`).
- **AI Media Analysis:** Generates automatic captions and smart tags for uploaded images using Google Gemini AI (`@google/generative-ai`).
- **Event Galleries:** Create private or public events, upload media, and organize them into folders.
- **Social Interactions:** Like, comment, favorite, and share photos effortlessly.
- **Instant Notifications:** Get notified when you are tagged, or when someone interacts with your uploads.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 19, Tailwind CSS (Vanilla CSS structure), Lucide Icons
- **Backend:** Next.js App Router (API Routes)
- **Database:** MySQL, Prisma ORM
- **Authentication:** NextAuth.js (Credentials/Session based)
- **AI & ML:** 
  - `@vladmandic/face-api` (Client-side Facial Recognition)
  - `@google/generative-ai` (Gemini Pro Vision for image analysis)
- **Storage:** Cloudinary
