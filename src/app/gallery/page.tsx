"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, MessageCircle, Share2, Download, X, ChevronLeft, ChevronRight, User } from "lucide-react";

import { createPortal } from "react-dom";

export default function PublicGallery() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const toggleCaption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCaptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) throw new Error("Failed to fetch gallery");
        const data = await res.json();
        setMedia(data);

        if (window.location.hash.startsWith("#media-")) {
          const hashId = window.location.hash.replace("#media-", "");
          const index = data.findIndex((m: any) => m.id === hashId);
          if (index !== -1) {
            setActiveMediaIndex(index);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const filteredMedia = media.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.event?.name?.toLowerCase().includes(query) ||
      item.event?.category?.toLowerCase().includes(query) ||
      item.uploader?.name?.toLowerCase().includes(query) ||
      item.tags?.some((t: any) => t.name?.toLowerCase().includes(query))
    );
  });

  const activeMedia = activeMediaIndex !== null ? filteredMedia[activeMediaIndex] : null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activeMediaIndex === null) return;

    if (e.key === "Escape") {
      setActiveMediaIndex(null);
    } else if (e.key === "ArrowRight") {
      setActiveMediaIndex(prev => (prev !== null && prev < filteredMedia.length - 1) ? prev + 1 : prev);
    } else if (e.key === "ArrowLeft") {
      setActiveMediaIndex(prev => (prev !== null && prev > 0) ? prev - 1 : prev);
    }
  }, [activeMediaIndex, filteredMedia.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleLike = async (mediaId: string, currentLiked: boolean) => {

    setMedia(prev => prev.map(m => {
      if (m.id === mediaId) {
        return {
          ...m,
          isLikedByMe: !currentLiked,
          likesCount: currentLiked ? m.likesCount - 1 : m.likesCount + 1
        };
      }
      return m;
    }));

    try {
      await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async (mediaId: string) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch("/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, content: commentText })
      });

      if (res.ok) {
        const newComment = await res.json();

        setMedia(prev => prev.map(m => {
          if (m.id === mediaId) {
            return {
              ...m,
              commentsCount: m.commentsCount + 1,
              comments: [newComment, ...m.comments]
            };
          }
          return m;
        }));
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (mediaId: string) => {
    try {
      const fullUrl = `${window.location.origin}/gallery#media-${mediaId}`;
      await navigator.clipboard.writeText(fullUrl);
      alert("Link to photo copied to clipboard!");

      const res = await fetch("/api/social/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId })
      });
      if (res.ok) {
        const data = await res.json();

        setMedia(prev => prev.map(m => m.id === mediaId ? { ...m, sharesCount: data.sharesCount } : m));
      }
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const openModal = (index: number) => {
    setActiveMediaIndex(index);
    window.history.pushState(null, "", `#media-${filteredMedia[index].id}`);
  };

  const closeModal = () => {
    setActiveMediaIndex(null);
    window.history.pushState(null, "", window.location.pathname);
  };

  return (
    <div className="animate-fade-in" style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="hero-title" style={{ fontSize: "2.2rem", marginBottom: "0.5rem", letterSpacing: "-1px" }}>Discover Moments</h1>
        <p className="hero-subtitle" style={{ fontSize: "1rem", maxWidth: "600px", margin: "0 auto", marginBottom: "2rem" }}>
          Explore trending photos from events across the platform.
        </p>

        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search events, categories, or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1rem 1rem 3.5rem",
              borderRadius: "9999px",
              border: "1px solid var(--glass-border)",
              background: "rgba(255, 255, 255, 0.7)",
              fontSize: "1rem",
              color: "#0f172a",
              outline: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.3s ease"
            }}
            onFocus={(e) => e.target.style.boxShadow = "0 4px 25px rgba(99,102,241,0.2)"}
            onBlur={(e) => e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="masonry">
          {filteredMedia.map((item, idx) => (
              <div key={item.id} id={`media-${item.id}`} className="masonry-item">
                <div
                  className="gallery-card glass-panel"
                  style={{ position: "relative", overflow: "hidden", borderRadius: "20px", cursor: "pointer", display: "flex", flexDirection: "column", border: "1px solid var(--glass-border)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                  onClick={() => openModal(idx)}
                >

                  <div style={{ position: "relative", width: "100%", height: "280px", overflow: "hidden" }}>
                    <img
                      src={item.s3Url}
                      alt="Gallery item"
                      className="gallery-image"
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    />

                    <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "0.4rem 1rem", borderRadius: "9999px", color: "white", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                      {item.event.name}
                    </div>

                    {item.userTags && item.userTags.length > 0 && (
                      <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", display: "flex", flexDirection: "row-reverse" }}>
                        {item.userTags.map((ut: any, index: number) => (
                          <div
                            key={ut.id}
                            style={{
                              width: "28px", height: "28px", borderRadius: "50%",
                              border: "2px solid rgba(255,255,255,0.2)", marginLeft: "-8px",
                              background: "#6366f1",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontSize: "0.7rem", fontWeight: "bold",
                              overflow: "hidden", zIndex: item.userTags!.length - index,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                            }}
                          >
                            {ut.taggedUser?.referenceImageUrl ? (
                              <img src={ut.taggedUser.referenceImageUrl} alt={ut.taggedUser.name || "User"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              ut.taggedUser?.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1.25rem", flexGrow: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.8)" }}>
                    {(() => {
                      const hasCaption = item.metadata?.caption && !item.metadata.caption.includes("Failed to generate") && !item.metadata.caption.includes("AI Analysis disabled");
                      const cleanCaption = hasCaption ? item.metadata.caption.replace(/#\w+/g, '').trim() : "";
                      const hasTags = item.tags && item.tags.length > 0;

                      const needsReadMore = cleanCaption.length > 40 || hasTags;
                      const isExpanded = expandedCaptions[item.id] || !needsReadMore;

                      return (
                        <div style={{ marginBottom: "1.25rem" }}>
                          {item.uploader && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                              <Link href={`/profile/${item.uploader?.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #d946ef)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "bold", overflow: "hidden" }}>
                                  {item.uploader?.referenceImageUrl ? (
                                    <img src={item.uploader.referenceImageUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    item.uploader?.name ? item.uploader.name.charAt(0).toUpperCase() : "U"
                                  )}
                                </div>
                                <span className="hover-underline" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1e293b" }}>
                                  {item.uploader?.name || item.uploader?.email?.split('@')[0] || "Unknown User"}
                                </span>
                              </Link>
                            </div>
                          )}

                          {hasCaption && (
                            <p style={{
                              fontSize: "0.9rem", color: "#475569", marginBottom: "0.2rem", lineHeight: "1.5",
                              display: isExpanded ? "block" : "-webkit-box",
                              WebkitLineClamp: isExpanded ? "unset" : 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}>
                              {cleanCaption}
                            </p>
                          )}

                          {hasTags && isExpanded && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                              {item.tags.slice(0, 4).map((t: any) => (
                                <span key={t.id || t.name} style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", background: "rgba(99,102,241,0.1)", color: "#6366f1", borderRadius: "6px", fontWeight: "600" }}>
                                  #{t.name?.replace(/\s+/g, "")}
                                </span>
                              ))}
                            </div>
                          )}

                          {needsReadMore && (
                            <button
                              onClick={(e) => toggleCaption(item.id, e)}
                              style={{ background: "none", border: "none", color: "#6366f1", fontSize: "0.85rem", cursor: "pointer", padding: 0, marginTop: "0.4rem", fontWeight: "700" }}
                              className="hover-underline"
                            >
                              {expandedCaptions[item.id] ? "Show Less" : "Read More"}
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <div style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: "600", display: "flex", gap: "1.25rem", marginTop: "auto" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(item.id, item.isLikedByMe); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: item.isLikedByMe ? "#ef4444" : "#64748b", fontWeight: "600", fontSize: "0.95rem", transition: "transform 0.1s" }}
                        className="hover-scale"
                      >
                        <Heart size={16} fill={item.isLikedByMe ? "#ef4444" : "none"} /> {item.likesCount}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(idx); setTimeout(() => document.getElementById("commentInput")?.focus(), 100); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontWeight: "600", fontSize: "0.95rem", transition: "transform 0.1s" }}
                        className="hover-scale"
                      >
                        <MessageCircle size={16} /> {item.commentsCount}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(item.id); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontWeight: "600", fontSize: "0.95rem", transition: "transform 0.1s" }}
                        className="hover-scale"
                      >
                        <Share2 size={16} /> {item.sharesCount || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem", width: "100%" }}>
          <h3 style={{ color: "#475569", fontSize: "1.5rem" }}>
            {searchQuery ? `No results found for "${searchQuery}"` : "No results found"}
          </h3>
        </div>
      )}

      {activeMediaIndex !== null && activeMedia && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(16px)",
          zIndex: 99999, display: "flex", animation: "fadeIn 0.2s ease"
        }}>

          <button
            onClick={(e) => { e.stopPropagation(); closeModal(); }}
            style={{
              position: "absolute", top: "1.5rem", left: "1.5rem",
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", cursor: "pointer", zIndex: 999999, transition: "background 0.2s ease"
            }}
            className="hover-bg-white-20"
          >
            <X size={24} />
          </button>

          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

            {activeMediaIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(activeMediaIndex - 1); }}
                style={{ position: "absolute", left: "2rem", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(10px)", transition: "background 0.2s ease" }}
                className="hover-bg-white-20"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <img src={activeMedia.s3Url} alt="Gallery Media" style={{ maxHeight: "90vh", maxWidth: "100%", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />

            {activeMediaIndex < filteredMedia.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(activeMediaIndex + 1); }}
                style={{ position: "absolute", right: "2rem", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(10px)", transition: "background 0.2s ease" }}
                className="hover-bg-white-20"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          <div style={{ width: "440px", background: "white", display: "flex", flexDirection: "column", boxShadow: "-10px 0 40px rgba(0,0,0,0.2)", borderTopLeftRadius: "24px", borderBottomLeftRadius: "24px", overflow: "hidden", margin: "1rem 1rem 1rem 0" }}>

            <div style={{ padding: "1.75rem", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href={`/profile/${activeMedia.uploader?.id}`} style={{ textDecoration: "none" }} onClick={closeModal}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #d946ef)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: "bold", overflow: "hidden" }}>
                    {activeMedia.uploader?.referenceImageUrl ? (
                      <img src={activeMedia.uploader.referenceImageUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      activeMedia.uploader?.name ? activeMedia.uploader.name.charAt(0).toUpperCase() : "U"
                    )}
                  </div>
                </Link>
                <div>
                  <Link href={`/profile/${activeMedia.uploader?.id}`} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "700", fontSize: "1.1rem" }} className="hover-underline" onClick={closeModal}>
                    {activeMedia.uploader?.name || activeMedia.uploader?.email?.split('@')[0] || "Unknown User"}
                  </Link>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
                    {new Date(activeMedia.uploadDate).toLocaleDateString()} • {new Date(activeMedia.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Link href={`/events/${activeMedia.event.id}/gallery`} style={{ textDecoration: "none", color: "#0f172a" }} className="hover-lift" onClick={closeModal}>
                  <h4 style={{ margin: "0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.05rem" }}>
                    {activeMedia.event.name} <span style={{ marginLeft: "auto", fontSize: "0.75rem", background: "linear-gradient(135deg, #6366f1, #d946ef)", color: "white", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontWeight: "700" }}>{activeMedia.event.category}</span>
                  </h4>
                </Link>
              </div>

              {(activeMedia.metadata?.caption || activeMedia.tags?.length > 0) && (
                <div style={{ background: "rgba(99,102,241,0.04)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.1)" }}>
                  {activeMedia.metadata?.caption && !activeMedia.metadata.caption.includes("Failed to generate") && !activeMedia.metadata.caption.includes("AI Analysis disabled") && (
                    <p style={{ fontSize: "0.95rem", color: "#1e293b", marginBottom: activeMedia.tags?.length > 0 ? "1rem" : "0", lineHeight: "1.6", margin: "0" }}>
                      {activeMedia.metadata.caption.replace(/#\w+/g, '').trim()}
                    </p>
                  )}

                  {activeMedia.tags?.length > 0 && (
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: activeMedia.metadata?.caption ? "0.75rem" : "0" }}>
                      {activeMedia.tags.map((t: any) => (
                        <span key={t.id || t.name} style={{ fontSize: "0.8rem", color: "#6366f1", background: "rgba(99,102,241,0.1)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>
                          #{t.name?.replace(/\s+/g, "")}
                        </span>
                      ))}
                    </div>
                  )}

                  {activeMedia.userTags?.length > 0 && (
                    <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed rgba(99,102,241,0.2)" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                        <User size={14} /> RECOGNIZED PEOPLE
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {activeMedia.userTags?.map((ut: any) => (
                          <Link key={ut.id} href={`/profile/${ut.taggedUser?.id}`} style={{ textDecoration: "none" }} onClick={closeModal}>
                            <span style={{ background: "white", border: "1px solid #cbd5e1", padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.85rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "600", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} className="hover-scale">
                              {ut.taggedUser?.name || ut.taggedUser?.email?.split('@')[0] || "Unknown"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem", background: "#f8fafc" }}>
              {activeMedia.comments?.length > 0 ? (
                activeMedia.comments.map((c: any) => (
                  <div key={c.id} style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.9rem", color: "#475569" }}>
                      {c.user.name ? c.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "#0f172a" }}>
                          {c.user.name || c.user.email.split('@')[0]}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.95rem", color: "#334155", lineHeight: "1.5", display: "block", marginTop: "0.25rem" }}>
                        {c.content}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "3rem", fontStyle: "italic", fontSize: "0.95rem" }}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            <div style={{ padding: "1.5rem 1.75rem", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1.25rem", background: "white" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1.25rem" }}>
                  <button
                    onClick={() => handleLike(activeMedia.id, activeMedia.isLikedByMe)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: activeMedia.isLikedByMe ? "#ef4444" : "#64748b", transition: "transform 0.15s ease" }}
                    className="hover-scale"
                  >
                    <Heart size={28} fill={activeMedia.isLikedByMe ? "#ef4444" : "none"} strokeWidth={activeMedia.isLikedByMe ? 0 : 2} />
                  </button>
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b", transition: "transform 0.15s ease" }}
                    className="hover-scale"
                    onClick={() => document.getElementById("commentInput")?.focus()}
                  >
                    <MessageCircle size={28} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => handleShare(activeMedia.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b", transition: "transform 0.15s ease" }}
                    className="hover-scale"
                    title="Share Link"
                  >
                    <Share2 size={26} strokeWidth={2} />
                  </button>
                </div>

                <a
                  href={`/api/download/${activeMedia.id}`}
                  style={{ textDecoration: "none", background: "#f1f5f9", padding: "0.5rem 1rem", borderRadius: "9999px", fontSize: "0.9rem", color: "#334155", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", transition: "background 0.2s" }}
                  className="hover-bg-slate-200"
                  download
                >
                  <Download size={16} /> Download
                </a>
              </div>

              <div style={{ fontWeight: "700", fontSize: "1rem", color: "#0f172a" }}>
                {activeMedia.likesCount} likes • {activeMedia.sharesCount || 0} shares
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <input
                  id="commentInput"
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitComment(activeMedia.id) }}
                  placeholder="Add a comment..."
                  style={{ flex: 1, padding: "0.85rem 1rem", borderRadius: "9999px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", color: "#0f172a", fontSize: "0.95rem", transition: "border 0.2s" }}
                  onFocus={e => e.target.style.border = "1px solid #94a3b8"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"}
                />
                <button
                  onClick={() => submitComment(activeMedia.id)}
                  disabled={!commentText.trim()}
                  style={{ background: "none", border: "none", color: "#6366f1", fontWeight: "700", fontSize: "0.95rem", cursor: commentText.trim() ? "pointer" : "default", opacity: commentText.trim() ? 1 : 0.4, padding: "0 0.5rem" }}
                >
                  Post
                </button>
              </div>

            </div>
          </div>
        </div>
        , document.body)}

      <style dangerouslySetInnerHTML={{
        __html: `
        .masonry {
          column-count: 1;
          column-gap: 2rem;
        }
        @media (min-width: 640px) { .masonry { column-count: 2; } }
        @media (min-width: 1024px) { .masonry { column-count: 3; } }
        @media (min-width: 1400px) { .masonry { column-count: 4; } }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 2rem;
        }
        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
        }
        .gallery-card:hover .gallery-image {
          transform: scale(1.05);
        }
        .hover-scale:hover {
          transform: scale(1.1);
        }
        .hover-bg-slate-200:hover {
          background: #e2e8f0 !important;
        }
        .hover-bg-white-20:hover {
          background: rgba(255,255,255,0.2) !important;
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
