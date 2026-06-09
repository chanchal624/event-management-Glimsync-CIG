# GlimSync Setup & Installation Guide 💻

This document walks you through setting up, configuring, and running the **GlimSync** project on your local machine.

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 18 or above recommended)
- [npm](https://www.npmjs.com/) (installed automatically with Node.js)
- A running MySQL instance (locally or hosted like PlanetScale/Aiven)

---

## 🛠️ Step-by-Step Installation

### 1. Clone the Codebase
```bash
git clone https://github.com/chanchal624/event-management-Glimsync-CIG.git
cd event-management-Glimsync-CIG
```

### 2. Install Project Dependencies
Run the command below in the project root folder:
```bash
npm install
```

### 3. Environment Variables Settings
Create a `.env` file in the root directory and configure the following variables:

```env
# Database Connection String
DATABASE_URL="mysql://username:password@localhost:3306/glimsync_db"

# NextAuth Authentication Config
NEXTAUTH_SECRET="any-random-string-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary Storage API Credentials
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Gemini AI API Key
GEMINI_API_KEY="your_google_gemini_api_key"
```

*Note: In production (e.g., Vercel), replace `NEXTAUTH_URL` with your actual deployment URL (e.g., `https://event-management-glimsync-cig.vercel.app`).*

### 4. Setup database schemas with Prisma
Sync the Prisma schema definitions with your database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🏗️ Production Deployment (Vercel)

1. Connect your GitHub repository to **Vercel**.
2. Add all environment variables listed in `.env` inside Vercel's Environment Variables settings.
3. Configure the Build Command to run `prisma generate && next build`.
4. Deploy the project.
