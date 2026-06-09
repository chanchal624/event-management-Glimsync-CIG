"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="hover-lift"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "32px",
        padding: "0 0.8rem",
        borderRadius: "8px",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        background: "rgba(239, 68, 68, 0.05)",
        color: "#ef4444",
        fontWeight: "600",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
      }}
    >
      Logout
    </button>
  );
}
