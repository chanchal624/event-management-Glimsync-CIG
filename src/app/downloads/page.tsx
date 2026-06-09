"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDownloads() {
      try {
        const res = await fetch("/api/downloads");
        if (res.ok) {
          const data = await res.json();
          setDownloads(data);
        }
      } catch (err) {
        console.error("Failed to fetch downloads", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
  }, []);

  const activeDownload = activeMediaIndex !== null ? downloads[activeMediaIndex] : null;

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#64748b", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }} className="hover-underline">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <h1 className="hero-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>My Downloads</h1>
        <p className="hero-subtitle" style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "0" }}>
          A record of all the memories you've saved to your device.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      ) : downloads.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⬇️</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>No downloads yet!</h3>
          <p style={{ color: "#475569", marginBottom: "2rem" }}>When you download photos from events or the gallery, they will appear here as a record.</p>
          <Link href="/gallery" className="btn-primary" style={{ textDecoration: "none" }}>
            Explore Gallery
          </Link>
        </div>
      ) : (
        <div className="masonry">
          {downloads.map((item, idx) => (
            <div key={item.id} className="masonry-item">
              <div
                className="gallery-card glass-panel"
                style={{ position: "relative", overflow: "hidden", borderRadius: "16px", cursor: "pointer" }}
                onClick={() => setActiveMediaIndex(idx)}
              >
                <div style={{ position: "relative", width: "100%", height: "200px" }}>
                  <img
                    src={item.media.s3Url}
                    alt="Downloaded item"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "0.4rem 0.8rem", borderRadius: "9999px", color: "white", fontSize: "0.75rem", fontWeight: "bold" }}>
                    📅 {item.media.event.name}
                  </div>
                </div>
                <div style={{ padding: "1rem", background: "var(--bg-secondary)" }}>
                  <p style={{ margin: "0 0 0.4rem 0", fontWeight: "bold", fontSize: "0.85rem" }}>
                    Downloaded on {new Date(item.downloadDate).toLocaleDateString()}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#475569" }}>
                    Uploaded by {item.media.uploader.name || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeMediaIndex !== null && activeDownload && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setActiveMediaIndex(null)}>
          <button
            style={{ position: "absolute", top: "2rem", right: "2rem", background: "rgba(255,255,255,0.2)", color: "white", border: "none", width: "50px", height: "50px", borderRadius: "50%", fontSize: "2rem", cursor: "pointer" }}
          >
            ×
          </button>
          <img src={activeDownload.media.s3Url} alt="Preview" style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", borderRadius: "8px" }} />
        </div>
        , document.body)}

      <style dangerouslySetInnerHTML={{
        __html: `
        .masonry { column-count: 1; column-gap: 1.5rem; }
        @media (min-width: 480px) { .masonry { column-count: 2; } }
        @media (min-width: 650px) { .masonry { column-count: 3; } }
        @media (min-width: 800px) { .masonry { column-count: 4; } }
        @media (min-width: 1200px) { .masonry { column-count: 5; } }
        .masonry-item { break-inside: avoid; margin-bottom: 1.5rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
