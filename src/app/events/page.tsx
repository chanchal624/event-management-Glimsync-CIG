"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Image as ImageIcon, Search, Plus, ArrowUpDown } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  category: string;
  location: string | null;
  coverImage: string | null;
  date: string;
  isOwner?: boolean;
  _count?: { media: number };
}

export default function EventsDashboard() {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [rawEvents, setRawEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRawEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const processedEvents = useMemo(() => {
    let mapped = rawEvents.map(e => {
      const eventDate = new Date(e.date);
      const isPast = eventDate < new Date();

      return {
        id: e.id,
        title: e.name,
        date: e.date,
        displayDate: eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        location: e.location || "Location TBD",
        status: isPast ? "Past" : "Upcoming",
        category: e.category,
        image: e.coverImage || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800",
        photoCount: e._count?.media || 0,
        isOwner: e.isOwner
      };
    });

    let result = filter === "All" ? mapped : mapped.filter(e => e.status === filter);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [rawEvents, filter, searchQuery, sortBy, sortOrder]);

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1400px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "2rem" }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2.8rem", marginBottom: "0.5rem", letterSpacing: "-1px" }}>Explore Events</h1>
          <p className="hero-subtitle" style={{ marginBottom: "0", maxWidth: "550px", fontSize: "1.1rem" }}>
            Discover, manage, and share your event galleries effortlessly.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/events/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem' }}>
            <Plus size={20} /> Create Event
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "1.25rem 2rem", marginBottom: "3rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "space-between", alignItems: "center", borderRadius: "16px" }}>

        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(0,0,0,0.03)", padding: "0.35rem", borderRadius: "12px" }}>
          {["All", "Upcoming", "Past"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.5rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                background: filter === f ? "white" : "transparent",
                color: filter === f ? "#0f172a" : "#64748b",
                boxShadow: filter === f ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "white", padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid var(--glass-border)" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", fontWeight: "600", color: "#0f172a", cursor: "pointer", fontSize: "0.9rem" }}
            >
              <option value="name">Event Name</option>
              <option value="date">Date</option>
              <option value="category">Category</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "0 0.25rem", color: "#6366f1" }}
              title={`Toggle order (currently ${sortOrder})`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "0.75rem 1.5rem 0.75rem 2.5rem",
                borderRadius: "10px",
                border: "1px solid var(--glass-border)",
                background: "white",
                color: "#0f172a",
                outline: "none",
                width: "260px",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"}
              onBlur={(e) => e.target.style.boxShadow = "none"}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: "600", fontSize: "0.9rem" }}>Loading events...</p>
        </div>
      ) : (

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {processedEvents.length > 0 ? processedEvents.map(event => (
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

                <div style={{ position: "relative", width: "100%", height: "180px", background: "#f8fafc" }}>
                  <Image src={event.image} alt={event.title} fill style={{ objectFit: "cover" }} unoptimized />

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
                    {event.status}
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

                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "0.75rem", color: "#0f172a", lineHeight: "1.3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {event.title}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem", flexGrow: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#64748b", fontSize: "0.9rem", fontWeight: "500" }}>
                      <Calendar size={16} color="#6366f1" /> {event.displayDate}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#64748b", fontSize: "0.9rem", fontWeight: "500" }}>
                      <MapPin size={16} color="#6366f1" /> {event.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#64748b", fontSize: "0.9rem", fontWeight: "500" }}>
                      <ImageIcon size={16} color="#6366f1" /> {event.photoCount} Photos
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {event.isOwner && (
                      <a href={`/events/${event.id}`} style={{ flex: 1, textAlign: "center", padding: "0.75rem", borderRadius: "10px", background: "#f1f5f9", color: "#334155", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"} onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}>
                        Manage
                      </a>
                    )}
                    <a href={`/events/${event.id}/gallery`} style={{ flex: 1, textAlign: "center", padding: "0.75rem", borderRadius: "10px", background: "#f1f5f9", color: "#334155", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"} onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}>
                      Gallery
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "5rem", background: "white", borderRadius: "20px", border: "1px dashed #cbd5e1" }}>
              <div style={{ width: "60px", height: "60px", background: "#f1f5f9", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <Search size={24} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "#334155", fontWeight: "700", marginBottom: "0.5rem" }}>No events found</h3>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

    </div>
  );
}
