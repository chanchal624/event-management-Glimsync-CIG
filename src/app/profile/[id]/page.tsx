import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const targetUserId = (await params).id;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    notFound();
  }

  const [eventsCount, mediaCount] = await Promise.all([
    prisma.event.count({ where: { createdById: targetUserId } }),
    prisma.media.count({ where: { uploaderId: targetUserId } })
  ]);

  const initials = targetUser.name
    ? targetUser.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  const isTargetAdmin = targetUser.role === "ADMIN";

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{ marginBottom: "2rem" }}>
        <Link href="/events" style={{ textDecoration: "none", color: "#475569", fontWeight: "600" }}>← Back to Dashboard</Link>
      </div>

      <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: "2.5rem", padding: "3rem", marginBottom: "3rem", position: "relative" }}>

        <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: isTargetAdmin ? "rgba(239, 68, 68, 0.15)" : "rgba(99,102,241,0.15)", color: isTargetAdmin ? "#f87171" : "#0f172a", padding: "0.25rem 1rem", borderRadius: "9999px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", border: `1px solid ${isTargetAdmin ? "rgba(239, 68, 68, 0.3)" : "rgba(99,102,241,0.3)"}` }}>
          {targetUser.role}
        </div>

        <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #d946ef)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "3rem", fontWeight: "900", boxShadow: "0 10px 30px rgba(99,102,241,0.3)", overflow: "hidden" }}>
          {targetUser.referenceImageUrl ? (
            <img src={targetUser.referenceImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials
          )}
        </div>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "0.25rem" }}>{targetUser.name}</h1>
          <p style={{ color: "#475569", fontSize: "1.1rem", marginBottom: "0" }}>{targetUser.email}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "3rem" }}>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>Overview</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "900", background: "linear-gradient(135deg, #6366f1, #d946ef)", WebkitBackgroundClip: "text", color: "transparent" }}>{eventsCount}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Events Hosted</div>
            </div>
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "900", background: "linear-gradient(135deg, #6366f1, #d946ef)", WebkitBackgroundClip: "text", color: "transparent" }}>{mediaCount}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Photos Uploaded</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
