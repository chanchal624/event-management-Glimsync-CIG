"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, User, Camera, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  useEffect(() => {

    if (session?.user?.name) {
      setName(session.user.name);
    }

    fetch('/api/settings/selfie')
      .then(res => res.json())
      .then(data => {
        if (data.url) setSelfieUrl(data.url);
      })
      .catch(console.error);
  }, [session]);

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/settings/selfie", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setSelfieUrl(data.url);

      await update();
    } catch (error) {
      console.error(error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;

    setSavingName(true);
    setNameSuccess(false);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Update failed");

      await update({ name });

      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>

      <div style={{ marginBottom: "2.5rem" }}>
        <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#64748b", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", marginBottom: "1.5rem" }} className="hover-underline">
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", color: "#0f172a" }}>Edit Profile</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        <div className="glass-panel" style={{ padding: "2.5rem", borderRadius: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", padding: "0.5rem", borderRadius: "10px" }}>
              <User size={24} />
            </div>
            <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#1e293b" }}>Personal Information</h2>
          </div>

          <div style={{ maxWidth: "400px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>FULL NAME</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border 0.2s"
                }}
                onFocus={(e) => e.target.style.border = "1px solid #6366f1"}
                onBlur={(e) => e.target.style.border = "1px solid var(--glass-border)"}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || !name.trim() || name === session?.user?.name}
                style={{
                  background: nameSuccess ? "#10b981" : "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0 1.5rem",
                  fontWeight: "600",
                  cursor: (savingName || !name.trim() || name === session?.user?.name) ? "default" : "pointer",
                  opacity: (savingName || !name.trim() || name === session?.user?.name) && !nameSuccess ? 0.6 : 1,
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  transition: "all 0.2s"
                }}
                className={nameSuccess ? "" : "hover-lift"}
              >
                {savingName ? <Loader2 size={18} className="animate-spin" /> : nameSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {savingName ? "Saving" : nameSuccess ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "2.5rem", borderRadius: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(217,70,239,0.1)", color: "#d946ef", padding: "0.5rem", borderRadius: "10px" }}>
              <Camera size={24} />
            </div>
            <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#1e293b" }}>Profile Picture</h2>
          </div>

          <p style={{ color: "#475569", marginBottom: "2rem", lineHeight: "1.6", maxWidth: "600px" }}>
            Upload a clear photo of your face. This will act as your avatar, and our AI will use it to securely find you in event photos!
          </p>

          <div style={{ display: "flex", gap: "3rem", alignItems: "center" }}>
            <div
              style={{
                width: "160px", height: "160px", borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(217,70,239,0.1))",
                border: "3px solid white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden",
                position: "relative"
              }}
            >
              {selfieUrl ? (
                <img src={selfieUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "3.5rem", color: "#94a3b8" }}>
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
              {uploading && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 size={32} color="white" className="animate-spin" />
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleSelfieUpload}
              />
              <button
                style={{ background: "white", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "9999px", padding: "0.75rem 1.5rem", fontWeight: "600", cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.7 : 1, boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="hover-bg-slate-200"
              >
                Choose Image...
              </button>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "1rem", maxWidth: "250px", lineHeight: "1.4" }}>
                Supports JPG, PNG, and WebP. Recommended size: 400x400px.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
