"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    category: "",
    isPrivate: false,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("date", new Date(formData.date).toISOString());
      data.append("category", formData.category);
      data.append("isPrivate", String(formData.isPrivate));
      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      const res = await fetch("/api/events", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: "3rem", maxWidth: "650px", margin: "0 auto" }}>
      <Link href="/events" style={{ color: "#475569", textDecoration: "none", marginBottom: "2rem", display: "inline-block", fontWeight: "600" }}>
        ← Back to Dashboard
      </Link>
      <h1 className="hero-title" style={{ fontSize: "2rem", marginBottom: "1.5rem", textAlign: "left" }}>Create New Event</h1>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.2rem", padding: "1.5rem" }}>
        {error && (
          <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "rgb(239, 68, 68)", fontSize: "0.9rem", textAlign: "center" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: "500", color: "#0f172a" }}>Event Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Annual Photography Walk"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", color: "#0f172a", fontSize: "0.9rem", outline: "none", transition: "border 0.2s" }}
            onFocus={(e) => e.currentTarget.style.border = "1px solid #6366f1"}
            onBlur={(e) => e.currentTarget.style.border = "1px solid rgba(0,0,0,0.1)"}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: "500", color: "#0f172a" }}>Description</label>
          <textarea
            rows={3}
            placeholder="Describe the event..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", color: "#0f172a", fontSize: "0.9rem", outline: "none", transition: "border 0.2s", resize: "vertical" }}
            onFocus={(e) => e.currentTarget.style.border = "1px solid #6366f1"}
            onBlur={(e) => e.currentTarget.style.border = "1px solid rgba(0,0,0,0.1)"}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: "500", color: "#0f172a" }}>Cover Image / Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setCoverImage(e.target.files[0]);
                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
              }
            }}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", border: "2px dashed rgba(99,102,241,0.3)", background: "#f8fafc", color: "#475569", fontSize: "0.9rem", cursor: "pointer", transition: "background 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.background = "#eff6ff"}
            onMouseOut={(e) => e.currentTarget.style.background = "#f8fafc"}
          />
          {previewUrl && (
            <div style={{ marginTop: "0.5rem", borderRadius: "8px", overflow: "hidden", height: "120px", width: "100%", position: "relative" }}>
              <img src={previewUrl} alt="Thumbnail preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "500", color: "#0f172a" }}>Date</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                id="event-date-input"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={{ flexGrow: 1, padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", color: "#0f172a", fontSize: "0.9rem", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "500", color: "#0f172a" }}>Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", color: "#0f172a", fontSize: "0.9rem", outline: "none" }}
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Social">Social</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontWeight: "500", color: "#0f172a" }}>Location</label>
          <input
            type="text"
            placeholder="e.g. Grand City Hall or Zoom Link"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", color: "#0f172a", fontSize: "0.9rem", outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
          <input
            type="checkbox"
            id="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
            style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
          />
          <label htmlFor="isPrivate" style={{ cursor: "pointer", color: "#475569", fontSize: "0.85rem" }}>
            Make this event private (Only authorized members can view)
          </label>
        </div>

        <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ padding: "0.75rem", fontSize: "1rem", marginTop: "1rem", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating Event..." : "Create Event"}
        </button>
        </div>
      </form>
    </div>
  );
}
