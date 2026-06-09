import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PhotosOfYouPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const photos = await prisma.media.findMany({
    where: {
      userTags: {
        some: {
          taggedUserId: session.user.id
        }
      }
    },
    include: {
      event: true
    },
    orderBy: {
      uploadDate: 'desc'
    }
  });

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>Photos of You</h1>
          <p className="hero-subtitle" style={{ marginBottom: "0" }}>
            AI Facial Recognition has detected you in these event photos.
          </p>
        </div>
        <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none', background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "#0f172a", boxShadow: "none" }}>
          Update Reference Selfie
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
          <h3>No photos found yet.</h3>
          <p style={{ color: "#475569" }}>Make sure you have uploaded a reference selfie in Settings, and that someone has uploaded a photo of you to an event!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {photos.map(photo => (
            <div key={photo.id} className="glass-panel" style={{ padding: "1rem" }}>
              <div style={{ position: "relative", width: "100%", height: "250px", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
                <Image src={photo.s3Url} alt={`Photo from ${photo.event.name}`} fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>{photo.event.name}</span>
                <a href={photo.s3Url} download={`glimsync-${photo.id}.jpg`} style={{ textDecoration: 'none', background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: "600" }}>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
