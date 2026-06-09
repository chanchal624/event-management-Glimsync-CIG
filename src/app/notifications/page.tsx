import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Heart, MessageCircle, Tag as TagIcon, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    include: {
      actor: { select: { name: true, referenceImageUrl: true } },
      media: { select: { s3Url: true, eventId: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (notifications.some(n => !n.read)) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "LIKE": return <Heart size={12} color="#f43f5e" fill="#f43f5e" />;
      case "COMMENT": return <MessageCircle size={12} color="#3b82f6" fill="#3b82f6" />;
      case "TAG": return <TagIcon size={12} color="#10b981" fill="#10b981" />;
      default: return <Activity size={12} color="#6366f1" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case "LIKE": return "rgba(244,63,94,0.15)";
      case "COMMENT": return "rgba(59,130,246,0.15)";
      case "TAG": return "rgba(16,185,129,0.15)";
      default: return "rgba(99,102,241,0.15)";
    }
  };

  const getMessage = (type: string, name: string) => {
    if (type === "LIKE") return <><span style={{fontWeight: "700", color: "#0f172a"}}>{name}</span> liked your photo</>;
    if (type === "COMMENT") return <><span style={{fontWeight: "700", color: "#0f172a"}}>{name}</span> commented on your photo</>;
    if (type === "TAG") return <><span style={{fontWeight: "700", color: "#0f172a"}}>{name}</span> tagged you in a photo</>;
    return <><span style={{fontWeight: "700", color: "#0f172a"}}>{name}</span> interacted with your media</>;
  };

  return (
    <div className="animate-fade-in" style={{ padding: "2rem", maxWidth: "750px", margin: "0 auto", minHeight: "80vh" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "12px", background: "white", color: "#64748b", border: "1px solid var(--glass-border)", textDecoration: "none", transition: "all 0.2s" }} className="hover-scale">
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "900", margin: 0, color: "#0f172a", letterSpacing: "-0.5px" }}>Notifications</h1>
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#64748b" }}>
            <Activity size={48} style={{ opacity: 0.2, margin: "0 auto 1rem" }} />
            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>You're all caught up!</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>No recent notifications to display.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {notifications.map((n) => {
              const date = new Date(n.createdAt);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHours / 24);

              let timeStr = "";
              if (diffMins < 60) timeStr = `${diffMins || 1}m ago`;
              else if (diffHours < 24) timeStr = `${diffHours}h ago`;
              else timeStr = `${diffDays}d ago`;

              return (
                <div key={n.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  borderRadius: "12px",
                  background: n.read ? "transparent" : "#f8fafc",
                  border: n.read ? "1px solid transparent" : "1px solid #e2e8f0",
                  transition: "all 0.2s"
                }} className={n.read ? "hover-lift" : ""}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontWeight: "bold", fontSize: "1.2rem", border: "1px solid #e2e8f0" }}>
                        {n.actor.referenceImageUrl ? (
                          <img src={n.actor.referenceImageUrl} alt={n.actor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          n.actor.name[0].toUpperCase()
                        )}
                      </div>
                      <div style={{ position: "absolute", bottom: "-2px", right: "-4px", width: "22px", height: "22px", borderRadius: "50%", background: "white", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                        <div style={{ background: getBgColor(n.type), width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {getIcon(n.type)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p style={{ margin: "0 0 0.2rem", color: "#475569", fontSize: "0.95rem", lineHeight: "1.4" }}>
                        {getMessage(n.type, n.actor.name)}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: n.read ? "#94a3b8" : "#6366f1", fontWeight: n.read ? "500" : "700" }}>
                          {timeStr}
                        </span>
                        {!n.read && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1" }}></span>}
                      </div>
                    </div>

                  </div>

                  {n.media && (
                    <Link href={`/events/${n.media.eventId}/gallery`} style={{ flexShrink: 0, marginLeft: "1rem" }}>
                      <div className="hover-scale" style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                        {n.media.s3Url.endsWith(".mp4") ? (
                          <video src={n.media.s3Url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <img src={n.media.s3Url} alt="Media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                    </Link>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
