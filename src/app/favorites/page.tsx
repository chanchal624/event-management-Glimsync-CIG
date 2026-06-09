"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface MediaItem {
  id: string;
  s3Url: string;
  event: { name: string };
}

export default function FavoritesPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) throw new Error("Failed to load favorites");
        const data = await res.json();
        setMedia(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "1rem", color: "#475569", fontWeight: "600" }}>Loading favorites...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>My Favorites</h1>
          <p className="hero-subtitle" style={{ marginBottom: "0" }}>All your starred images in one place</p>
        </div>
        <Link href="/profile" className="btn-primary" style={{ textDecoration: "none" }}>
          ← Back to Profile
        </Link>
      </div>

      {error && <div style={{ padding: "1rem", color: "red", border: "1px solid red", marginBottom: "2rem" }}>{error}</div>}

      {media.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#475569", background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "1px dashed var(--glass-border)" }}>
          <h3>No favorites yet!</h3>
          <p>Go to an event gallery and star some photos to see them here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {media.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%", height: "250px", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
                <img src={item.s3Url} alt="Media" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#475569", fontWeight: "600" }}>{item.event?.name}</span>
                <a href={`/api/download/${item.id}`} className="btn-primary" style={{ textDecoration: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem" }}>⬇️ Download</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
