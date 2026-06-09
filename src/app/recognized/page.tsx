"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";

interface TagItem {
  id: string;
  tagger: { id: string; name: string; email: string };
  media: {
    id: string;
    s3Url: string;
    event: { id: string; name: string };
  };
}

export default function RecognizedPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags?type=ai");
        if (!res.ok) throw new Error("Failed to load recognized photos");
        const data = await res.json();
        setTags(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "1rem", color: "#475569", fontWeight: "600" }}>Loading your images...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/profile" className="hover-scale" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "#64748b", fontSize: "0.85rem", fontWeight: "600", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#0f172a"} onMouseOut={e => e.currentTarget.style.color = "#64748b"}>
          ← Back to Profile
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>View My Image</h1>
          <p className="hero-subtitle" style={{ marginBottom: "0", fontSize: "1rem" }}>Photos where GlimSync AI recognized your face</p>
        </div>
      </div>

      {error && <div style={{ padding: "1rem", color: "red", border: "1px solid red", marginBottom: "2rem" }}>{error}</div>}

      {tags.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#475569", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px dashed var(--glass-border)" }}>
          <h3>No photos yet!</h3>
          <p>When the AI recognizes your face in an event photo, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {tags.map((item) => (
            <div key={item.id} className="glass-panel hover-lift" style={{ padding: "0.8rem", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%", height: "180px", borderRadius: "8px", overflow: "hidden", marginBottom: "0.8rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <img src={item.media.s3Url} alt="Recognized Media" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                <a href={`/api/download/${item.media.id}`} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", padding: "0.4rem", borderRadius: "50%", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,1)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.8)"}>
                  <Download size={16} />
                </a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
                <Link href={`/events/${item.media.event?.id}/gallery`} style={{ fontSize: "0.9rem", color: "#0f172a", fontWeight: "600", textDecoration: "none" }}>
                  <span style={{ cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.textDecoration = "underline"} onMouseOut={e => e.currentTarget.style.textDecoration = "none"}>
                    {item.media.event?.name}
                  </span>
                </Link>
                <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                  🤖 Auto-tagged by AI
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
