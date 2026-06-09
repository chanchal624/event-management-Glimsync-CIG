import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserManagement from "./UserManagement";
import { Users, Calendar, Image as ImageIcon } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [totalUsers, totalEvents, totalMedia, allUsers] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.media.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
  ]);

  return (
    <div className="animate-fade-in" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#dc2626", marginBottom: "0.5rem" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#475569", fontSize: "1.1rem" }}>System Overview & Control Panel</p>
        </div>
        <Link href="/profile" className="hover-lift" style={{ padding: "0.5rem 1.25rem", borderRadius: "9999px", border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.05)", fontWeight: "600", fontSize: "0.9rem" }}>
          Back to Profile
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2.5rem" }}>

        <div className="glass-panel hover-lift" style={{ padding: "1.5rem", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.2rem" }}>Total Users</div>
            <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", lineHeight: "1" }}>{totalUsers}</div>
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ padding: "1.5rem", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.2rem" }}>Total Events</div>
            <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", lineHeight: "1" }}>{totalEvents}</div>
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ padding: "1.5rem", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(236,72,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899" }}>
            <ImageIcon size={28} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.2rem" }}>Total Media</div>
            <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", lineHeight: "1" }}>{totalMedia}</div>
          </div>
        </div>

      </div>

      <UserManagement initialUsers={allUsers} />

    </div>
  );
}
