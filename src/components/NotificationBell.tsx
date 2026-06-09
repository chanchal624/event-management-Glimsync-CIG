"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor: { name: string };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (e) {

    }
  };

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {

      await fetch("/api/notifications", { method: "POST" });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const getMessage = (n: Notification) => {
    if (n.type === "LIKE") return `${n.actor.name} liked your photo`;
    if (n.type === "COMMENT") return `${n.actor.name} commented on your photo`;
    if (n.type === "TAG") return `${n.actor.name} tagged you in a photo`;
    return `${n.actor.name} interacted with your media`;
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={handleOpen}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(99, 102, 241, 0.1)",
          color: "var(--text-primary)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          fontSize: "1.2rem",
          cursor: "pointer",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s"
        }}
        className="hover-lift"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            background: "red",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: "bold",
            padding: "2px 5px",
            borderRadius: "50%"
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "50px",
          right: "0",
          width: "350px",
          maxHeight: "400px",
          overflowY: "auto",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          padding: "1rem",
          border: "1px solid var(--glass-border)",
          zIndex: 100
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-primary)" }}>Notifications</h3>
          {notifications.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>No new notifications</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: n.read ? "transparent" : "rgba(99, 102, 241, 0.1)",
                  border: n.read ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(99, 102, 241, 0.2)",
                  color: "var(--text-primary)"
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>{getMessage(n)}</p>
                    <small style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  {n.media && (
                    <div style={{ flexShrink: 0, marginLeft: "1rem" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        {n.media.s3Url?.endsWith(".mp4") ? (
                          <video src={n.media.s3Url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <img src={n.media.s3Url} alt="Media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ))}

              <Link href="/notifications" style={{
                display: "block",
                textAlign: "center",
                padding: "0.75rem",
                marginTop: "0.5rem",
                borderRadius: "8px",
                background: "#f1f5f9",
                color: "#475569",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "background 0.2s"
              }} className="hover-bg">
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
