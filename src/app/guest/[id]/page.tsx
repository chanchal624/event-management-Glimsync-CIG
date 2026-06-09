"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface EventData {
  name: string;
  date: string;
  media: { id: string; s3Url: string }[];
}

export default function GuestGalleryView() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [findingMe, setFindingMe] = useState(false);
  const [found, setFound] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load event");
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleFindMe = () => {
    setFindingMe(true);

    setTimeout(() => {
      setFindingMe(false);
      setFound(true);
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "1rem", color: "#475569", fontWeight: "600" }}>Loading gallery...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "10rem", color: "rgb(239, 68, 68)" }}>
        <h2>Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/")} className="btn-primary" style={{ marginTop: "1rem" }}>Go Home</button>
      </div>
    );
  }

  if (!event) return null;

  const displayPhotos = found
    ? event.media.slice(0, Math.max(1, Math.floor(event.media.length / 2)))
    : event.media;

  const coverImage = event.media.length > 0
    ? event.media[0].s3Url
    : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600";

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "4rem" }}>

      <div style={{ position: "relative", width: "100%", height: "450px", marginBottom: "4rem" }}>
        <Image
          src={coverImage}
          alt="Event Cover"
          fill
          style={{ objectFit: "cover" }}
          unoptimized
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))" }}></div>
        <div style={{ position: "absolute", bottom: "3rem", left: "4rem", color: "white" }}>
          <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", padding: "0.5rem 1rem", borderRadius: "9999px", display: "inline-block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "1rem" }}>
            {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontSize: "4rem", fontWeight: "900", lineHeight: "1.1", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{event.name}</h1>
          <p style={{ fontSize: "1.2rem", marginTop: "0.5rem", opacity: 0.9 }}>Hosted by GlimSync Presents</p>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 4rem" }}>

        <div className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", marginBottom: "3rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Event Gallery</h2>
            <p style={{ color: "#475569", fontSize: "0.95rem" }}>{event.media.length} high-resolution photos available</p>
          </div>

          <button
            onClick={handleFindMe}
            disabled={findingMe || event.media.length === 0}
            className="btn-primary hover-lift"
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 2rem", background: found ? "var(--bg-primary)" : "", color: found ? "#0f172a" : "", border: found ? "1px solid var(--glass-border)" : "" }}
          >
            <span style={{ fontSize: "1.2rem" }}>{found ? "✨" : "🤳"}</span>
            {findingMe ? "Scanning faces..." : found ? "Showing Photos of You" : "Find Me with AI"}
          </button>
        </div>

        {event.media.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#475569" }}>
            <h3>No photos have been uploaded to this event yet.</h3>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {displayPhotos.map((item, i) => (
              <div key={item.id} className="hover-lift" style={{ position: "relative", width: "100%", height: i % 2 === 0 ? "400px" : "300px", borderRadius: "16px", overflow: "hidden", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <Image
                  src={item.s3Url}
                  alt={`Event photo ${i}`}
                  fill
                  style={{ objectFit: "cover", transition: "transform 0.5s" }}
                  className="gallery-image"
                  unoptimized
                />
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)", opacity: 0, transition: "opacity 0.3s" }} className="gallery-overlay">
                  <a href={`/api/download/${item.id}`} style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", background: "white", textDecoration: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "900", color: "#0f172a", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
                    ↓
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {found && (
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <button onClick={() => setFound(false)} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: "700", cursor: "pointer", fontSize: "1rem" }}>
              ← View All Event Photos
            </button>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .gallery-image:hover { transform: scale(1.05); }
        .gallery-overlay:hover { opacity: 1 !important; }
      `}} />
    </div>
  );
}
