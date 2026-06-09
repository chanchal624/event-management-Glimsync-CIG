"use client";

import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
}

export default function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER"
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      setUsers(users.filter(u => u.id !== id));
      alert(`User ${name} successfully deleted.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add user");

      setUsers([data, ...users]);
      setShowAddModal(false);
      setFormData({ name: "", email: "", password: "", role: "VIEWER" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>Manage Users</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary hover-lift" style={{ padding: "0.5rem 1.25rem", borderRadius: "9999px", fontSize: "0.9rem" }}>
          + Add User
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Role</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Joined</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: "700", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i === users.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#f8fafc"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: "600", color: "#0f172a" }}>{u.name}</td>
                <td style={{ padding: "1rem 1.5rem", color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    background: u.role === "ADMIN" ? "rgba(239, 68, 68, 0.1)" : u.role === "PHOTOGRAPHER" ? "rgba(16, 185, 129, 0.1)" : "rgba(99,102,241,0.1)",
                    color: u.role === "ADMIN" ? "#ef4444" : u.role === "PHOTOGRAPHER" ? "#10b981" : "#6366f1",
                    border: `1px solid ${u.role === "ADMIN" ? "rgba(239, 68, 68, 0.2)" : u.role === "PHOTOGRAPHER" ? "rgba(16, 185, 129, 0.2)" : "rgba(99,102,241,0.2)"}`
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.9rem" }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    className="hover-scale"
                    style={{ background: "transparent", color: "#ef4444", border: "1px solid #fca5a5", padding: "0.4rem 0.8rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s" }}
                    onMouseOver={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#ef4444"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#475569" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>Add New User</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", color: "#475569", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <form onSubmit={handleAddSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {error && <div style={{ color: "#f87171", background: "rgba(239, 68, 68, 0.1)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem" }}>{error}</div>}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem" }}>Full Name</label>
                <input required type="text" value={formData.name} autoComplete="off" onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#0f172a", outline: "none", transition: "border 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#6366f1"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem" }}>Email Address</label>
                <input required type="email" value={formData.email} autoComplete="off" onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#0f172a", outline: "none", transition: "border 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#6366f1"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem" }}>Password</label>
                <input required type="password" value={formData.password} autoComplete="new-password" onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#0f172a", outline: "none", transition: "border 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#6366f1"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem" }}>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#0f172a", outline: "none", transition: "border 0.2s", cursor: "pointer" }} onFocus={(e) => e.target.style.borderColor = "#6366f1"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}>
                  <option value="VIEWER">Viewer</option>
                  <option value="CLUB_MEMBER">Club Member</option>
                  <option value="PHOTOGRAPHER">Photographer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary hover-lift" style={{ marginTop: "1rem", padding: "1rem", borderRadius: "8px" }}>
                {loading ? "Adding..." : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
