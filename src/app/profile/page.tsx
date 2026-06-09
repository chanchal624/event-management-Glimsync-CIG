import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import {
  Star, Tag, Download, Heart, MessageCircle, Share2,
  Calendar, Edit3, Image as ImageIcon, Shield, Activity, MapPin
} from "lucide-react";
import FaceIdGenerator from "@/components/FaceIdGenerator";

export default async function UserProfile() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const [eventsCount, photosCount, videosCount, user, myEvents, totalLikes, totalComments, totalSharesObj] = await Promise.all([
    prisma.event.count({ where: { createdById: session.user.id } }),
    prisma.media.count({ where: { uploaderId: session.user.id, NOT: { s3Url: { contains: ".mp4" } } } }),
    prisma.media.count({ where: { uploaderId: session.user.id, s3Url: { contains: ".mp4" } } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { referenceImageUrl: true, faceEncodingId: true } }),
    prisma.event.findMany({
      where: { createdById: session.user.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        date: true,
        coverImage: true,
        location: true,
        _count: { select: { media: true } }
      }
    }),
    prisma.like.count({ where: { media: { uploaderId: session.user.id } } }),
    prisma.comment.count({ where: { media: { uploaderId: session.user.id } } }),
    prisma.media.aggregate({ where: { uploaderId: session.user.id }, _sum: { sharesCount: true } })
  ]);

  const totalShares = totalSharesObj._sum.sharesCount || 0;

  const initials = session.user.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="animate-fade-in" style={{ padding: "2rem", maxWidth: "950px", margin: "0 auto" }}>

      <div className="glass-panel" style={{ padding: "0", overflow: "hidden", marginTop: "2rem", marginBottom: "1.5rem", borderRadius: "24px", position: "relative" }}>

        <div style={{ height: "80px", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(217,70,239,0.2))" }}></div>

        <div style={{ padding: "0 2rem 2rem", display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{
                width: "100px", height: "100px", borderRadius: "50%",
                marginTop: "-50px",
                background: "linear-gradient(135deg, #6366f1, #d946ef)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "2.5rem", fontWeight: "900",
                border: "4px solid white", boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                overflow: "hidden", flexShrink: 0
              }}>
                {user?.referenceImageUrl ? (
                  <img src={user.referenceImageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>

              <div style={{ paddingBottom: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "#0f172a", letterSpacing: "-0.5px" }}>
                    {session.user.name}
                  </h1>
                  <span style={{
                    background: isAdmin ? "rgba(239, 68, 68, 0.1)" : "rgba(99,102,241,0.1)",
                    color: isAdmin ? "#ef4444" : "#6366f1",
                    padding: "0.2rem 0.6rem", borderRadius: "9999px",
                    fontWeight: "800", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px"
                  }}>
                    {session.user.role}
                  </span>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
                  {session.user.email}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/settings" className="hover-scale" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "32px", gap: "0.4rem", padding: "0 0.8rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white", fontWeight: "600", fontSize: "0.8rem", color: "#0f172a", textDecoration: "none", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", whiteSpace: "nowrap" }}>
                <Edit3 size={14} /> Edit Profile
              </Link>
              <Link href="/recognized" className="hover-scale" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "32px", gap: "0.4rem", padding: "0 0.8rem", borderRadius: "8px", background: "#0f172a", color: "white", fontWeight: "600", fontSize: "0.8rem", textDecoration: "none", boxShadow: "0 4px 10px rgba(15,23,42,0.2)", whiteSpace: "nowrap" }}>
                <ImageIcon size={14} /> View My Image
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hover-scale" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "32px", gap: "0.4rem", padding: "0 0.8rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: "600", fontSize: "0.8rem", textDecoration: "none", border: "1px solid rgba(239, 68, 68, 0.2)", whiteSpace: "nowrap" }}>
                  <Shield size={14} /> Admin
                </Link>
              )}
              <LogoutButton />
            </div>

          </div>
        </div>
      </div>

      <FaceIdGenerator referenceImageUrl={user?.referenceImageUrl || null} hasFaceId={!!user?.faceEncodingId} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <Link href="/favorites" className="glass-panel hover-scale" style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "#0f172a", borderRadius: "16px" }}>
          <div style={{ background: "#f8fafc", color: "#334155", padding: "0.5rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Star size={18} strokeWidth={2} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>Favorites</span>
        </Link>

        <Link href="/tagged" className="glass-panel hover-scale" style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "#0f172a", borderRadius: "16px" }}>
          <div style={{ background: "#f8fafc", color: "#334155", padding: "0.5rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Tag size={18} strokeWidth={2} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>Tagged</span>
        </Link>

        <Link href="/downloads" className="glass-panel hover-scale" style={{ padding: "0.8rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "#0f172a", borderRadius: "16px" }}>
          <div style={{ background: "#f8fafc", color: "#334155", padding: "0.5rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Download size={18} strokeWidth={2} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>Downloads</span>
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={18} color="#6366f1" /> Performance Overview
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ background: "white", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>Events Hosted</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0f172a", lineHeight: "1" }}>{eventsCount}</div>
          </div>
          <div style={{ background: "white", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>Photos Uploaded</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0f172a", lineHeight: "1" }}>{photosCount}</div>
          </div>
          <div style={{ background: "white", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>Videos Uploaded</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0f172a", lineHeight: "1" }}>{videosCount}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          <div style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.1)", borderRadius: "12px", padding: "0.75rem", textAlign: "center" }}>
            <Heart size={16} color="#f43f5e" style={{ margin: "0 auto 0.25rem" }} />
            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#f43f5e", lineHeight: "1", marginBottom: "0.15rem" }}>{totalLikes}</div>
            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Likes</div>
          </div>
          <div style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: "12px", padding: "0.75rem", textAlign: "center" }}>
            <MessageCircle size={16} color="#3b82f6" style={{ margin: "0 auto 0.25rem" }} />
            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#3b82f6", lineHeight: "1", marginBottom: "0.15rem" }}>{totalComments}</div>
            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Comments</div>
          </div>
          <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "12px", padding: "0.75rem", textAlign: "center" }}>
            <Share2 size={16} color="#6366f1" style={{ margin: "0 auto 0.25rem" }} />
            <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#6366f1", lineHeight: "1", marginBottom: "0.15rem" }}>{totalShares}</div>
            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Shares</div>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0f172a", marginBottom: "1rem" }}>My Hosted Events</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
          {myEvents.length > 0 ? myEvents.map(event => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const status = isPast ? "Past" : "Upcoming";
            const imageUrl = event.coverImage || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800";

            return (
              <div key={event.id} className="hover-lift" style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%"
                }}>

                  <div style={{ position: "relative", width: "100%", height: "140px", background: "#f8fafc" }}>
                    <Image src={imageUrl} alt={event.name} fill style={{ objectFit: "cover" }} unoptimized />

                    <div style={{
                      position: "absolute",
                      top: "1rem", left: "1rem",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      color: "white",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase"
                    }}>
                      {status}
                    </div>

                    <div style={{
                      position: "absolute",
                      top: "1rem", right: "1rem",
                      background: "var(--accent-color)",
                      color: "white",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      boxShadow: "0 4px 10px var(--accent-glow)"
                    }}>
                      {event.category}
                    </div>
                  </div>

                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "0.5rem", color: "#0f172a", lineHeight: "1.3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {event.name}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem", flexGrow: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem", fontWeight: "500" }}>
                        <Calendar size={14} color="#6366f1" /> {eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem", fontWeight: "500" }}>
                        <MapPin size={14} color="#6366f1" /> {event.location || "Location TBD"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem", fontWeight: "500" }}>
                        <ImageIcon size={14} color="#6366f1" /> {event._count?.media || 0} Photos
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/events/${event.id}`} style={{ flex: 1, textAlign: "center", padding: "0.5rem", borderRadius: "8px", background: "#f1f5f9", color: "#334155", fontWeight: "600", fontSize: "0.8rem", textDecoration: "none", transition: "background 0.2s" }} className="hover-bg-slate-200">
                        Manage
                      </Link>
                      <Link href={`/events/${event.id}/gallery`} style={{ flex: 1, textAlign: "center", padding: "0.5rem", borderRadius: "8px", background: "#f1f5f9", color: "#334155", fontWeight: "600", fontSize: "0.8rem", textDecoration: "none", transition: "background 0.2s" }} className="hover-bg-slate-200">
                        Gallery
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", background: "white", borderRadius: "20px", border: "1px dashed var(--glass-border)" }}>
              <div style={{ width: "60px", height: "60px", background: "#f1f5f9", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <Calendar size={24} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "#334155", fontWeight: "700", marginBottom: "0.5rem" }}>No events found</h3>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>You haven't hosted any events yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
