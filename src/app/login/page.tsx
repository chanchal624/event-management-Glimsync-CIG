"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
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
    <div className="animate-fade-in" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      <div style={{ width: "100%", maxWidth: "450px" }}>
        <div className="glass-panel" style={{ padding: "3rem", borderRadius: "24px", background: "rgba(255,255,255,0.85)" }}>

          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", color: "#0f172a", marginBottom: "0.5rem" }}>
              Welcome Back
            </h1>
            <p style={{ color: "#475569", fontSize: "0.95rem" }}>
              Sign in to manage your events and media.
            </p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {error && (
              <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "rgb(239, 68, 68)", fontSize: "0.9rem", textAlign: "center" }}>
                {error}
              </div>
            )}

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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>PASSWORD</label>
                <a href="#" style={{ fontSize: "0.8rem", color: "#6366f1", fontWeight: "600" }}>Forgot?</a>
              </div>
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

            <button type="submit" className="btn-primary hover-lift" disabled={loading} style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0" }}>
            <div style={{ height: "1px", background: "var(--glass-border)", flex: 1 }}></div>
            <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "600" }}>OR</span>
            <div style={{ height: "1px", background: "var(--glass-border)", flex: 1 }}></div>
          </div>

          <button className="hover-lift" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", background: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontWeight: "600", color: "#0f172a", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "20px", height: "20px" }} />
            Sign in with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "#475569" }}>
            Don't have an account? <Link href="/register" style={{ color: "#6366f1", fontWeight: "700" }}>Sign up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
