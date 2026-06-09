"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EventData {
  id: string;
  name: string;
  description: string;
  date: string;
  isPrivate: boolean;
  category: string;
  location: string | null;
  coverImage: string | null;
  isOwner?: boolean;
}

export default function ManageEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    isPrivate: false,
    category: "",
    location: "",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) {
          if (res.status === 404) router.push("/events");
          throw new Error("Failed to fetch event details");
        }
        const data = await res.json();
        setEvent(data);
        setFormData({
          name: data.name,
          description: data.description || "",
          date: new Date(data.date).toISOString().slice(0, 16),
          isPrivate: data.isPrivate,
          category: data.category || "",
          location: data.location || "",
        });
        if (data.coverImage) {
          setPreviewUrl(data.coverImage);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId, router]);

  if (!loading && event && event.isOwner === false) {
    return (
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <h2 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "1rem" }}>Access Denied</h2>
        <p style={{ color: "#475569", marginBottom: "2rem" }}>You do not have permission to manage this event.</p>
        <Link href={`/events/${eventId}/gallery`} className="btn-primary" style={{ textDecoration: "none" }}>
          Go to Gallery
        </Link>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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

      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to update event");

      const updated = await res.json();
      setEvent(updated);
      alert("Event updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyGuestLink = () => {
    const link = `${window.location.origin}/guest/${eventId}`;
    navigator.clipboard.writeText(link);
    alert("Guest link copied to clipboard: " + link);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "10rem" }}>
        <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "1rem", color: "#475569", fontWeight: "600" }}>Loading settings...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/events" style={{ color: "#475569", textDecoration: "none", marginBottom: "2rem", display: "inline-block", fontWeight: "600" }}>
        ← Back to Dashboard
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2.5rem", marginBottom: "0", textAlign: "left" }}>Manage Event</h1>
          {event && <p style={{ color: "#475569", marginTop: "0.25rem" }}>Editing settings for: <strong>{event.name}</strong></p>}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href={`/events/${eventId}/gallery`} className="btn-primary" style={{ textDecoration: "none", background: "linear-gradient(135deg, #6366f1, #d946ef)" }}>
            Go to Gallery
          </Link>
          <button className="btn-primary" style={{ background: "rgba(239, 68, 68, 0.9)", border: "none", boxShadow: "none" }} onClick={handleDelete}>
            Delete Event
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "rgb(239, 68, 68)", marginBottom: "2rem" }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: "2rem" }}>

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ color: "#0f172a", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Privacy Controls</h4>
              <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0 }}>Make this event private so only authorized guests can view or upload media.</p>
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                />
                <span style={{ fontWeight: "600", color: formData.isPrivate ? "#6366f1" : "#475569" }}>
                  Private
                </span>
              </label>
            </div>
          </div>

          <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ color: "#0f172a", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Guest List</h4>
              <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0 }}>Invite users by sharing the guest link.</p>
            </div>
            <button type="button" onClick={copyGuestLink} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "transparent", border: "1px solid var(--glass-border)", color: "#0f172a", boxShadow: "none" }}>
              🔗 Copy Link
            </button>
          </div>

          <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
            <h4 style={{ color: "#0f172a", marginBottom: "1rem", fontSize: "1.1rem" }}>Edit Details</h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>EVENT NAME</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.1)", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.1)", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>COVER IMAGE</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverImage(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px dashed var(--glass-border)", background: "rgba(0,0,0,0.1)", color: "#0f172a", cursor: "pointer" }}
                />
                {previewUrl && (
                  <div style={{ marginTop: "0.5rem", borderRadius: "8px", overflow: "hidden", height: "150px", width: "100%", position: "relative" }}>
                    <img src={previewUrl} alt="Thumbnail preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>DATE & TIME</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.1)", color: "#0f172a" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>CATEGORY</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.1)", color: "#0f172a" }}
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
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>LOCATION</label>
                <input
                  type="text"
                  placeholder="e.g. Grand City Hall or Zoom Link"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.1)", color: "#0f172a" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "0.75rem 2rem" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
