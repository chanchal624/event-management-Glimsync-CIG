"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

interface TagItem {
  id: string;
  tagger: { id: string; name: string; email: string };
  media: {
    id: string;
    s3Url: string;
    event: { id: string; name: string };
  };
}

export default function TaggedPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags?type=manual");
        if (!res.ok) throw new Error("Failed to load tagged photos");
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
        <p style={{ marginTop: "1rem", color: "#475569", fontWeight: "600" }}>Loading tagged photos...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#64748b", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }} className="hover-underline">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <h1 className="hero-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Tagged Photos</h1>
        <p className="hero-subtitle" style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "0" }}>Images where other users have manually tagged you</p>
      </div>

      {error && <div style={{ padding: "1rem", color: "red", border: "1px solid red", marginBottom: "2rem" }}>{error}</div>}

      {tags.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#475569", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px dashed var(--glass-border)" }}>
          <h3>No tags yet!</h3>
          <p>When someone tags you in a photo using your email, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2rem" }}>
          {tags.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
                <img src={item.media.s3Url} alt="Tagged Media" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <Link href={`/events/${item.media.event?.id}/gallery`} style={{ fontSize: "0.8rem", color: "#0f172a", fontWeight: "600", textDecoration: "none" }}>
                    <span style={{ cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.textDecoration = "underline"} onMouseOut={e => e.currentTarget.style.textDecoration = "none"}>
                      {item.media.event?.name}
                    </span>
                  </Link>
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                    🏷️ Tagged by <Link href={`/profile/${item.tagger.id}`} style={{ color: "#6366f1", fontWeight: "bold", textDecoration: "none" }}><span style={{ cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.textDecoration = "underline"} onMouseOut={e => e.currentTarget.style.textDecoration = "none"}>{item.tagger.name || item.tagger.email}</span></Link>
                  </span>
                </div>
                <a
                  href={`/api/download/${item.media.id}`}
                  className="hover-scale"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid var(--glass-border)",
                    color: "#475569",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "transform 0.1s ease",
                    flexShrink: 0
                  }}
                  title="Download"
                  download
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
