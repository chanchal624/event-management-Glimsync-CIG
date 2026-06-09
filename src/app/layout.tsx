import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { Home } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlimSync | Event Media Management",
  description: "Scalable platform for photographers and organizers to upload and manage event media.",
};

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  let userAvatar = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referenceImageUrl: true }
    });
    userAvatar = user?.referenceImageUrl;
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <nav className="glass-panel" style={{ padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#6366f1', letterSpacing: '-1px' }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>GlimSync</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link href="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Home size={18} /> Home
              </Link>
              <Link href="/events" className="nav-link">Explore Events</Link>
              <Link href="/gallery" className="nav-link">Gallery Feed</Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />

              {!session ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none' }}>Login</Link>
                  <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none', background: 'white', color: '#6366f1', border: '1px solid #6366f1', boxShadow: 'none' }}>Register</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none' }}>Login</Link>
                  <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none', background: 'white', color: '#6366f1', border: '1px solid #6366f1', boxShadow: 'none' }}>Register</Link>
                  <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }} className="hover-scale">
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #d946ef)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
                      {userAvatar ? (
                        <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        session.user.name ? session.user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U"
                      )}
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{session.user.name?.split(' ')[0]}</span>
                  </Link>
                </div>
              )}
            </div>
        </nav>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
