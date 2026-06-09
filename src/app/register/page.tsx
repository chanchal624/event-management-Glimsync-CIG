"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div className="glass-panel" style={{ padding: "3rem", borderRadius: "24px", background: "rgba(255,255,255,0.85)" }}>

          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", color: "#0f172a", marginBottom: "0.5rem" }}>
              Create an Account
            </h1>
            <p style={{ color: "#475569", fontSize: "0.95rem" }}>
              Join GlimSync and start managing your events.
            </p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {error && (
              <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "rgb(239, 68, 68)", fontSize: "0.9rem", textAlign: "center" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>FULL NAME</label>
              <input
                type="text"
                required
                value={name}
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.2s"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.2s"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.2s"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>ACCOUNT TYPE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
              >
                <option value="VIEWER">Guest / Event Attendee</option>
                <option value="PHOTOGRAPHER">Photographer / Event Organizer</option>
              </select>
            </div>

            <button type="submit" className="btn-primary hover-lift" disabled={loading} style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px" }}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2.5rem", fontSize: "0.9rem", color: "#475569" }}>
            Already have an account? <Link href="/login" style={{ color: "#6366f1", fontWeight: "700" }}>Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
