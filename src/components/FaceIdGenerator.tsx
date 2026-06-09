"use client";

import React, { useState } from "react";
import { ScanFace } from "lucide-react";

export default function FaceIdGenerator({ referenceImageUrl, hasFaceId = false }: { referenceImageUrl: string | null, hasFaceId?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(hasFaceId ? "success" : "idle");
  const [message, setMessage] = useState(hasFaceId ? "Face ID successfully generated! You will now be auto-tagged in event photos." : "");

  const generateFaceId = async () => {
    if (!referenceImageUrl) {
      setMessage("Please upload a profile picture first!");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("Loading AI models in your browser (might take a few seconds)...");

    try {

      if (!(window as any).faceapi) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load face-api.js"));
          document.head.appendChild(script);
        });
      }

      const faceapi = (window as any).faceapi;
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      setMessage("Scanning your profile picture...");

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = referenceImageUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected in your profile picture. Please upload a clear photo of your face.");
      }

      setMessage("Face detected! Saving Face ID securely...");
      const descriptorArray = Array.from(detection.descriptor);

      const res = await fetch("/api/settings/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceDescriptor: descriptorArray })
      });

      if (!res.ok) throw new Error("Failed to save Face ID to server");

      setStatus("success");
      setMessage("Face ID successfully generated! You will now be auto-tagged in event photos.");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "An unknown error occurred.");
    }
  };

  return (
    <div style={{ marginTop: "1rem", background: "rgba(99,102,241,0.05)", border: "1px dashed rgba(99,102,241,0.3)", borderRadius: "12px", padding: "1.25rem" }}>
      <h3 style={{ fontSize: "1rem", color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <ScanFace size={18} color="#6366f1" /> Enable Auto-Tagging
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem", lineHeight: "1.5" }}>
        Click the button below to generate a mathematical "Face ID" from your profile picture using AI right in your browser. This will allow the system to automatically tag you in event photos!
      </p>

      <button
        onClick={generateFaceId}
        disabled={status === "loading" || status === "success"}
        className="btn-primary hover-scale"
        style={{
          padding: "0.5rem 1rem",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: status === "success" ? "#10b981" : undefined,
          boxShadow: status === "success" ? "0 4px 10px rgba(16,185,129,0.3)" : undefined,
          opacity: status === "loading" ? 0.7 : 1
        }}
      >
        <ScanFace size={16} />
        {status === "loading" ? "Processing..." : status === "success" ? "Face ID Active!" : "Generate Face ID"}
      </button>

      {message && (
        <div style={{
          marginTop: "1rem",
          fontSize: "0.85rem",
          color: status === "error" ? "#ef4444" : status === "success" ? "#10b981" : "#6366f1",
          fontWeight: "600",
          background: status === "error" ? "rgba(239,68,68,0.1)" : status === "success" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
          padding: "0.75rem",
          borderRadius: "8px"
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
