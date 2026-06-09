"use client";

import React, { useState } from "react";

interface MediaItem {
  id: string;
  s3Url: string;
  tags?: { tag: { name: string } }[];
  _count?: { likes: number; comments: number };
  metadata?: any;
}

export default function SmartSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  const toggleCaption = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCaptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search/smart?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.media) setResults(data.media);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>AI Smart Search</h1>
      <p className="hero-subtitle" style={{ marginBottom: "3rem" }}>Find photos by objects, colors, and concepts automatically tagged by AI.</p>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. dog, sunset, graduation, blue car..."
          style={{ flexGrow: 1, padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.2)", color: "white", fontSize: "1.1rem" }}
        />
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "0 2rem", fontSize: "1.1rem" }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {hasSearched && !loading && results.length === 0 && (
        <div style={{ textAlign: "center", color: "#475569", fontSize: "1.2rem", marginTop: "2rem" }}>
          No images found matching your search.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
        {results.map((item) => (
          <div key={item.id} className="glass-panel hover-lift" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", width: "100%", height: "200px" }}>
              <img src={item.s3Url} alt="Search result" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ padding: "1rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {(() => {
                const hasCaption = item.metadata?.caption && !item.metadata.caption.includes("Failed to generate") && !item.metadata.caption.includes("AI Analysis disabled");
                const cleanCaption = hasCaption ? item.metadata.caption.replace(/#\w+/g, '').trim() : "";
                const hasTags = item.tags && item.tags.length > 0;

                if (!hasCaption && !hasTags) return null;

                const needsReadMore = cleanCaption.length > 40 || hasTags;
                const isExpanded = expandedCaptions[item.id] || !needsReadMore;

                return (
                  <div>
                    {hasCaption && (
                      <p style={{
                        fontSize: "0.85rem", color: "#475569", marginBottom: "0.2rem", fontStyle: "italic", lineHeight: "1.4",
                        display: isExpanded ? "block" : "-webkit-box",
                        WebkitLineClamp: isExpanded ? "unset" : 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        "{cleanCaption}"
                      </p>
                    )}

                    {hasTags && isExpanded && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                        {item.tags?.slice(0, 4).map((t: any) => (
                          <span key={t.tag.name} style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: "rgba(99,102,241,0.15)", color: "white", borderRadius: "4px" }}>
                            #{t.tag.name.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                    )}

                    {needsReadMore && (
                      <button
                        onClick={(e) => toggleCaption(item.id, e)}
                        style={{ background: "none", border: "none", color: "#6366f1", fontSize: "0.8rem", cursor: "pointer", padding: 0, marginTop: "0.2rem", fontWeight: "bold" }}
                        className="hover-underline"
                      >
                        {expandedCaptions[item.id] ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
