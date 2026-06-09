"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Download, Folder, Plus, Sparkles, X, Heart, MessageCircle, Share2, CloudUpload, ArrowLeft, Trash2 } from "lucide-react";
import JSZip from "jszip";

interface MediaItem {
  id: string;
  s3Url: string;
  tags?: { tag: { name: string } }[];
  likes?: { userId: string }[];
  favorites?: { userId: string }[];
  _count?: { likes: number; comments: number };
  metadata?: any;
  folderId?: string | null;
  userTags?: { taggedUser: { id: string; name: string; email: string; referenceImageUrl?: string } }[];
  uploader?: { id: string; name: string | null; email: string | null };
  uploaderId?: string;
  uploadDate?: string | Date;
  comments?: any[];
}

interface Folder {
  id: string;
  name: string;
  eventId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string, email: string };
}

interface StagedFile {
  file: File;
  previewUrl: string;
  caption: string;
  tags: string[];
  isGeneratingAI: boolean;
  error?: string;
}

export default function EventGalleryPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [canUpload, setCanUpload] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  const toggleCaption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCaptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState("");

  const handleDownloadAll = async () => {
    const activeMediaItems = media.filter(item => 
      activeFolderId === null ? true : item.folderId === activeFolderId
    );

    if (activeMediaItems.length === 0) {
      alert("No media to download!");
      return;
    }

    try {
      setDownloadingZip(true);
      setZipProgress("Starting download...");

      const zip = new JSZip();

      for (let i = 0; i < activeMediaItems.length; i++) {
        const item = activeMediaItems[i];
        setZipProgress(`Downloading photo ${i + 1} of ${activeMediaItems.length}...`);
        
        const res = await fetch(`/api/download/${item.id}`);
        if (!res.ok) throw new Error(`Failed to download media ${item.id}`);
        const blob = await res.blob();
        
        const extension = item.s3Url.split('.').pop()?.split('?')[0] || "jpg";
        const filename = `photo_${item.id}.${extension}`;
        
        zip.file(filename, blob);
      }

      setZipProgress("Generating ZIP file...");
      const content = await zip.generateAsync({ type: "blob" });
      
      setZipProgress("Saving ZIP file...");
      const folderName = activeFolderId === null 
        ? "event_gallery" 
        : (folders.find(f => f.id === activeFolderId)?.name || "folder_gallery");
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setZipProgress("");
      alert("ZIP file downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to download: ${err.message}`);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDeleteAll = async () => {
    const isFolder = activeFolderId !== null;
    const confirmMessage = isFolder
      ? "Are you sure you want to delete this folder and ALL photos inside it?"
      : "Are you sure you want to delete this event, ALL its folders, and ALL its photos? This action cannot be undone.";

    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      if (isFolder) {
        const res = await fetch(`/api/events/${eventId}/folders?folderId=${activeFolderId}`, {
          method: "DELETE"
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to delete folder");
        }
        
        setFolders(prev => prev.filter(f => f.id !== activeFolderId));
        setMedia(prev => prev.filter(item => item.folderId !== activeFolderId));
        setActiveFolderId(null);
        alert("Folder deleted successfully!");
      } else {
        const res = await fetch(`/api/events/${eventId}`, {
          method: "DELETE"
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to delete event");
        }
        alert("Event deleted successfully!");
        router.push("/events");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight' && selectedIndex < media.length - 1) setSelectedIndex(selectedIndex + 1);
      if (e.key === 'ArrowLeft' && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, media.length]);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [res, sessionRes, foldersRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch('/api/auth/session'),
          fetch(`/api/events/${eventId}/folders`)
        ]);

        if (!res.ok) {
          if (res.status === 404) router.push("/events");
          throw new Error("Failed to load gallery");
        }

        const data = await res.json();

        if (data.media) setMedia(data.media);
        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData);
        }

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setCurrentUser(sessionData?.user || null);
          if (sessionData?.user?.id === data.createdById) {
            setCanUpload(true);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [eventId, router]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFiles = async (files: File[]) => {
    const newStaged = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
      tags: [],
      isGeneratingAI: false
    }));
    setStagedFiles(prev => [...prev, ...newStaged]);
  };

  const handleGenerateAI = async (index: number) => {
    const staged = stagedFiles[index];
    setStagedFiles(prev => prev.map((s, i) => i === index ? { ...s, isGeneratingAI: true, error: undefined } : s));

    try {
      const formData = new FormData();
      formData.append("file", staged.file);
      const res = await fetch("/api/ai/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate");

      setStagedFiles(prev => prev.map((s, i) => i === index ? {
        ...s,
        caption: data.caption || "",
        tags: data.tags || [],
        isGeneratingAI: false
      } : s));

    } catch (err: any) {
      setStagedFiles(prev => prev.map((s, i) => i === index ? { ...s, isGeneratingAI: false, error: err.message } : s));
    }
  };

  const uploadStagedFiles = async () => {
    if (stagedFiles.length === 0) return;
    setUploading(true); setError("");

    try {

      let referenceFaces: any[] = [];
      try {
        const faceRes = await fetch('/api/users/faces');
        if (faceRes.ok) referenceFaces = await faceRes.json();
      } catch (e) {
        console.warn("Failed to fetch reference faces", e);
      }

      if (referenceFaces.length > 0) {
        if (!(window as any).faceapi) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load face-api"));
            document.head.appendChild(script);
          });
        }
        const faceapi = (window as any).faceapi;
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
        if (!faceapi.nets.ssdMobilenetv1.params) {
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
          ]);
        }
      }

      const uploadedMedia: MediaItem[] = [];
      for (const staged of stagedFiles) {
        const formData = new FormData();

        const matchedUserIds: string[] = [];
        if (referenceFaces.length > 0) {
          try {
            const faceapi = (window as any).faceapi;
            const img = new window.Image();
            img.src = staged.previewUrl;
            await new Promise(r => { img.onload = r; });

            const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

            for (const detection of detections) {
              for (const ref of referenceFaces) {
                if (!ref.faceEncodingId) continue;
                const refDescriptor = new Float32Array(JSON.parse(ref.faceEncodingId));
                const distance = faceapi.euclideanDistance(detection.descriptor, refDescriptor);
                if (distance < 0.6) {
                  if (!matchedUserIds.includes(ref.id)) matchedUserIds.push(ref.id);
                }
              }
            }
          } catch (e) {
            console.error("Face matching failed for image", e);
          }
        }

        formData.append("file", staged.file);
        formData.append("eventId", eventId);
        if (activeFolderId) formData.append("folderId", activeFolderId);
        formData.append("customCaption", staged.caption);
        if (staged.tags.length > 0) formData.append("preGeneratedTags", JSON.stringify(staged.tags));
        if (matchedUserIds.length > 0) formData.append("matchedUserIds", JSON.stringify(matchedUserIds));

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`Failed to upload ${staged.file.name}: ${errData.error || res.statusText}`);
        }
        const newMediaObj = await res.json();
        if (currentUser) {
          newMediaObj.uploader = {
            id: currentUser.id || "",
            name: currentUser.name || "",
            email: currentUser.email || ""
          };
        }
        uploadedMedia.push(newMediaObj);
      }
      setMedia(prev => [...uploadedMedia, ...prev]);

      stagedFiles.forEach(s => URL.revokeObjectURL(s.previewUrl));
      setStagedFiles([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleLike = async (mediaId: string) => {
    setMedia(prev => prev.map(m => {
      if (m.id === mediaId) {
        const isLiked = m.likes && m.likes.length > 0;
        return {
          ...m,
          likes: isLiked ? [] : [{ userId: "temp" }],
          _count: { ...m._count, likes: m._count ? (isLiked ? Math.max(0, m._count.likes - 1) : m._count.likes + 1) : 1, comments: m._count?.comments || 0 }
        };
      }
      return m;
    }));
    await fetch(`/api/media/${mediaId}/like`, { method: "POST" }).catch(console.error);
  };

  const handleToggleFavorite = async (mediaId: string) => {
    setMedia(prev => prev.map(m => {
      if (m.id === mediaId) {
        const isFav = m.favorites && m.favorites.length > 0;
        return { ...m, favorites: isFav ? [] : [{ userId: "temp" }] };
      }
      return m;
    }));
    await fetch(`/api/media/${mediaId}/favorite`, { method: "POST" }).catch(console.error);
  };

  const handleShare = (s3Url: string) => {
    const fullUrl = `${window.location.origin}${s3Url}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Image link copied to clipboard!");
  };

  const loadComments = async (mediaId: string) => {
    setActiveCommentId(mediaId);
    setComments([]);
    try {
      const res = await fetch(`/api/media/${mediaId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error("Failed to load comments:", e);
    }
  };

  useEffect(() => {
    if (selectedIndex !== null && media[selectedIndex]) {
      loadComments(media[selectedIndex].id);
    } else {
      setComments([]);
      setActiveCommentId(null);
    }
  }, [selectedIndex, media]);

  const postComment = async (e: React.FormEvent, mediaId: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/media/${mediaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [comment, ...prev]);
        setNewComment("");
        setMedia(prev => prev.map(m => m.id === mediaId ? { ...m, _count: { ...m._count, likes: m._count?.likes || 0, comments: (m._count?.comments || 0) + 1 } } : m));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post comment");
      }
    } catch (e) {
      alert("Error posting comment.");
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this photo? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Photo deleted successfully!");
        setSelectedIndex(null); // Close the modal
        setMedia(prev => prev.filter(m => m.id !== mediaId)); // Remove from media list
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete photo");
      }
    } catch (e) {
      alert("Error deleting photo.");
    }
  };

  const handleTagUser = async (mediaId: string) => {
    const email = prompt("Enter the Email address of the user you want to tag:");
    if (!email) return;

    const res = await fetch(`/api/media/${mediaId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taggedUserEmail: email.trim() })
    });

    if (res.ok) {
      alert("User tagged successfully! They have been notified.");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to tag user.");
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "10rem" }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button
        onClick={() => router.push('/events')}
        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: 0, marginBottom: '2rem' }}
        className="hover-lift"
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: "2rem", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>
            {activeFolderId === null 
              ? "Event Gallery" 
              : `Folder: ${folders.find(f => f.id === activeFolderId)?.name || "Folder"}`}
          </h1>
          {zipProgress && (
            <p style={{ fontSize: "0.85rem", color: "#6366f1", margin: 0, fontWeight: "600" }}>
              ⏳ {zipProgress}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={handleDownloadAll}
            disabled={downloadingZip || media.length === 0}
            className="hover-scale"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "#475569",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: (downloadingZip || media.length === 0) ? "default" : "pointer",
              opacity: (downloadingZip || media.length === 0) ? 0.5 : 1,
              transition: "transform 0.1s ease"
            }}
            title={activeFolderId === null ? "Download Whole Event" : "Download Subfolder"}
          >
            <Download size={18} />
          </button>

          {canUpload && (
            <button
              onClick={handleDeleteAll}
              disabled={downloadingZip}
              className="hover-scale"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: downloadingZip ? "default" : "pointer",
                opacity: downloadingZip ? 0.5 : 1,
                transition: "transform 0.1s ease"
              }}
              title={activeFolderId === null ? "Delete Whole Event" : "Delete Subfolder"}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ padding: "1rem", color: "red", border: "1px solid red", marginBottom: "2rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "2rem" }} className="custom-scrollbar">
        <button
          onClick={() => setActiveFolderId(null)}
          style={{ padding: "0.5rem 1.5rem", borderRadius: "99px", border: "1px solid var(--glass-border)", background: activeFolderId === null ? "#6366f1" : "var(--glass-bg)", color: activeFolderId === null ? "white" : "#0f172a", fontWeight: activeFolderId === null ? "bold" : "normal", whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.2s" }}
        >
          All Media
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setActiveFolderId(folder.id)}
            style={{ padding: "0.5rem 1.5rem", borderRadius: "99px", border: "1px solid var(--glass-border)", background: activeFolderId === folder.id ? "#6366f1" : "var(--glass-bg)", color: activeFolderId === folder.id ? "white" : "#0f172a", fontWeight: activeFolderId === folder.id ? "bold" : "normal", whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.2s" }}
          >
            <Folder size={14} style={{ marginRight: "4px" }} /> {folder.name}
          </button>
        ))}
        {canUpload && (
          <button
            onClick={() => setIsCreatingFolder(true)}
            style={{ padding: "0.5rem 1.5rem", borderRadius: "99px", border: "1px dashed #6366f1", background: "none", color: "#6366f1", whiteSpace: "nowrap", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            className="hover-bg"
          >
            <Plus size={16} /> New Folder
          </button>
        )}
      </div>

      {isCreatingFolder && (
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!newFolderName.trim()) return;
          try {
            const res = await fetch(`/api/events/${eventId}/folders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newFolderName.trim() })
            });
            if (!res.ok) throw new Error("Failed to create folder");
            const folder = await res.json();
            setFolders(prev => [...prev, folder]);
            setIsCreatingFolder(false);
            setNewFolderName("");
            setActiveFolderId(folder.id);
          } catch (err: any) {
            alert(err.message);
          }
        }} style={{ display: "flex", gap: "1rem", marginBottom: "2rem", background: "var(--glass-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
          <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." autoFocus style={{ flexGrow: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white", outline: "none", color: "#0f172a" }} />
          <button type="submit" className="btn-primary" disabled={!newFolderName.trim()} style={{ padding: "0.75rem 1.5rem" }}>Create</button>
          <button type="button" onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }} style={{ padding: "0.75rem 1.5rem", background: "none", border: "none", color: "#475569", cursor: "pointer" }}>Cancel</button>
        </form>
      )}

      {canUpload && stagedFiles.length === 0 && (
        <div
          className="glass-panel"
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          style={{ border: isDragging ? "2px dashed #3b82f6" : "2px dashed var(--glass-border)", textAlign: "center", padding: "4rem 2rem", marginBottom: "3rem", background: isDragging ? "rgba(59, 130, 246, 0.1)" : "var(--glass-bg)" }}
        >
          <input type="file" multiple accept="image/*,video/*" style={{ display: "none" }} ref={fileInputRef} onChange={(e) => { if (e.target.files) handleFiles(Array.from(e.target.files)); }} />
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}><CloudUpload size={48} color="#6366f1" /></div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Drag & Drop media here</h3>
          <button onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", color: "#475569", textDecoration: "underline", cursor: "pointer", fontSize: "1rem", padding: "0.5rem" }}>or click to browse files</button>
        </div>
      )}

      {stagedFiles.length > 0 && (
        <div style={{ marginBottom: "3rem", padding: "2rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem" }}>Staging Area ({stagedFiles.length} files)</h2>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => { stagedFiles.forEach(s => URL.revokeObjectURL(s.previewUrl)); setStagedFiles([]); }} className="btn-secondary" style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.3)", color: "white", cursor: "pointer" }}>Cancel All</button>
              <button onClick={uploadStagedFiles} disabled={uploading} className="btn-primary" style={{ padding: "0.5rem 1.5rem" }}>
                {uploading ? "Uploading..." : "Confirm & Upload All"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {stagedFiles.map((staged, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: "1rem", position: "relative" }}>
                <button onClick={() => { URL.revokeObjectURL(staged.previewUrl); setStagedFiles(prev => prev.filter((_, i) => i !== idx)); }} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "#0f172a", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} strokeWidth={3} /></button>

                <div style={{ width: "100%", height: "150px", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
                  {staged.file.type.startsWith("video/") ? (
                    <video src={staged.previewUrl} style={{ objectFit: "cover", width: "100%", height: "100%" }} muted loop autoPlay playsInline />
                  ) : (
                    <img src={staged.previewUrl} alt="Preview" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  )}
                </div>

                {staged.error && <div style={{ color: "red", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{staged.error}</div>}

                <textarea
                  value={staged.caption}
                  onChange={e => setStagedFiles(prev => prev.map((s, i) => i === idx ? { ...s, caption: e.target.value } : s))}
                  placeholder="write caption"
                  style={{ width: "100%", height: "60px", padding: "0.75rem", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "#0f172a", fontSize: "0.85rem", resize: "none", outline: "none" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
        {media.filter(item => activeFolderId === null ? true : item.folderId === activeFolderId).map((item, index) => (
          <div key={item.id} className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column" }}>
            <div
              style={{ position: "relative", width: "100%", height: "250px", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
              <div onClick={() => setSelectedIndex(index)} style={{ width: "100%", height: "100%", cursor: "zoom-in", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
                {item.metadata?.resourceType === 'video' || item.s3Url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video src={item.s3Url} style={{ objectFit: "cover", width: "100%", height: "100%" }} muted loop autoPlay playsInline />
                ) : (
                  <img src={item.s3Url} alt="Media" style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                )}

                {item.userTags && item.userTags.length > 0 && (
                  <div style={{ position: "absolute", bottom: "8px", right: "8px", display: "flex", flexDirection: "row-reverse" }}>
                    {item.userTags.map((ut: any, idx: number) => (
                      <div
                        key={ut.taggedUser.id}
                        title={`${ut.taggedUser.name} (AI Identified)`}
                        style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          border: "2px solid white", marginLeft: "-8px",
                          background: "linear-gradient(135deg, #6366f1, #d946ef)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: "0.7rem", fontWeight: "bold",
                          overflow: "hidden", zIndex: item.userTags!.length - idx,
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                        }}
                      >
                        {ut.taggedUser.referenceImageUrl ? (
                          <img src={ut.taggedUser.referenceImageUrl} alt={ut.taggedUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          ut.taggedUser.name[0].toUpperCase()
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={`/api/download/${item.id}`}
                style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", transition: "all 0.2s", zIndex: 10 }}
                className="hover-scale"
                title="Download"
              >
                <Download size={16} color="#0f172a" />
              </a>
            </div>

            <div style={{ marginBottom: "1rem", flexGrow: 1 }}>
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
                        fontSize: "0.9rem", color: "#475569", marginBottom: "0.2rem", fontStyle: "italic", lineHeight: "1.4",
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
                        {item.tags?.map((t: any) => (
                          <span key={t.tag.name} style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "rgba(99,102,241,0.1)", color: "white", borderRadius: "4px" }}>
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", gap: "1.25rem" }}>
                <button onClick={() => handleToggleLike(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.4rem", filter: item.likes?.length ? "none" : "grayscale(100%) opacity(50%)", transition: "transform 0.1s" }} className="hover-scale">
                  ❤️ <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#475569", filter: "none" }}>{item._count?.likes || 0}</span>
                </button>
                <button onClick={() => setSelectedIndex(index)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.4rem", filter: "grayscale(100%) opacity(70%)", transition: "transform 0.1s" }} className="hover-scale">
                  💬 <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#475569", filter: "none" }}>{item._count?.comments || 0}</span>
                </button>
              </div>
              <button onClick={() => handleToggleFavorite(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", filter: item.favorites?.length ? "none" : "grayscale(100%) opacity(40%)", transition: "transform 0.1s" }} className="hover-scale">
                ⭐️
              </button>
            </div>

          </div>
        ))}
      </div>

      {selectedIndex !== null && media.filter(item => activeFolderId === null ? !item.folderId : item.folderId === activeFolderId)[selectedIndex] && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          zIndex: 99999, display: "flex", animation: "fadeIn 0.2s ease"
        }}>
          {(() => {
            const filteredMedia = media.filter(item => activeFolderId === null ? true : item.folderId === activeFolderId);
            const currentMedia = filteredMedia[selectedIndex];
            return (
              <>

                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                  style={{
                    position: "absolute", top: "1.5rem", left: "1.5rem",
                    background: "rgba(255,255,255,0.2)", backdropFilter: "blur(5px)",
                    border: "none", borderRadius: "50%", width: "45px", height: "45px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "2rem", cursor: "pointer", zIndex: 999999
                  }}
                  className="hover-scale"
                >
                  ×
                </button>

                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

                  {selectedIndex > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                      style={{ position: "absolute", left: "2rem", background: "rgba(255,255,255,0.2)", color: "white", border: "none", width: "50px", height: "50px", borderRadius: "50%", fontSize: "1.5rem", cursor: "pointer", backdropFilter: "blur(5px)" }}
                      className="hover-scale"
                    >
                      ←
                    </button>
                  )}

                  {currentMedia.metadata?.resourceType === 'video' || currentMedia.s3Url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video src={currentMedia.s3Url} controls autoPlay style={{ maxHeight: "90vh", maxWidth: "100%", borderRadius: "8px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }} />
                  ) : (
                    <img src={currentMedia.s3Url} alt="Media" style={{ maxHeight: "90vh", maxWidth: "100%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }} />
                  )}

                  {selectedIndex < filteredMedia.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                      style={{ position: "absolute", right: "2rem", background: "rgba(255,255,255,0.2)", color: "white", border: "none", width: "50px", height: "50px", borderRadius: "50%", fontSize: "1.5rem", cursor: "pointer", backdropFilter: "blur(5px)" }}
                      className="hover-scale"
                    >
                      →
                    </button>
                  )}
                </div>

          <div style={{ width: "400px", background: "var(--bg-primary)", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--glass-border)", boxShadow: "-10px 0 30px rgba(0,0,0,0.3)" }}>

            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "1rem" }}>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href={`/profile/${currentMedia.uploader?.id || ""}`} style={{ textDecoration: "none" }} onClick={() => setSelectedIndex(null)}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #d946ef)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                    {currentMedia.uploader?.name ? currentMedia.uploader.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </Link>
                <div>
                  <Link href={`/profile/${currentMedia.uploader?.id || ""}`} style={{ textDecoration: "none", color: "#0f172a", fontWeight: "bold", fontSize: "1.1rem" }} className="hover-underline" onClick={() => setSelectedIndex(null)}>
                    {currentMedia.uploader?.name || currentMedia.uploader?.email?.split('@')[0] || "Unknown User"}
                  </Link>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569", marginTop: "0.2rem" }}>
                    {new Date(currentMedia.uploadDate || Date.now()).toLocaleDateString()} at {new Date(currentMedia.uploadDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {(currentMedia.metadata?.caption || (currentMedia.tags?.length ?? 0) > 0) && (
                <div style={{ background: "rgba(99,102,241,0.05)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.1)" }}>
                  {currentMedia.metadata?.caption && !currentMedia.metadata.caption.includes("Failed to generate") && !currentMedia.metadata.caption.includes("AI Analysis disabled") && (
                    <p style={{ fontSize: "0.95rem", color: "#0f172a", marginBottom: (currentMedia.tags?.length ?? 0) > 0 ? "0.8rem" : "0", fontStyle: "italic", lineHeight: "1.5", margin: "0" }}>
                      "{currentMedia.metadata.caption.replace(/#\w+/g, '').trim()}"
                    </p>
                  )}

                  {(currentMedia.tags?.length ?? 0) > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: currentMedia.metadata?.caption ? "0.5rem" : "0" }}>
                      {currentMedia.tags?.map((t: any) => (
                        <span key={t.id || t.tag?.id} style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: "500" }}>
                          #{t.tag?.name || t.name?.replace(/\s+/g, "")}
                        </span>
                      ))}
                    </div>
                  )}

                  {(currentMedia.userTags?.length ?? 0) > 0 && (
                    <div style={{ marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(99,102,241,0.2)" }}>
                      <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>
                        👤 Recognized People
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {currentMedia.userTags?.map((ut: any) => (
                          <Link key={ut.taggedUser.id} href={`/profile/${ut.taggedUser.id}`} style={{ textDecoration: "none" }} onClick={() => setSelectedIndex(null)}>
                            <span style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", padding: "0.3rem 0.6rem", borderRadius: "9999px", fontSize: "0.8rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.25rem" }} className="hover-lift">
                              {ut.taggedUser.name || ut.taggedUser.email.split('@')[0]}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(comments?.length ?? 0) > 0 ? (
                comments?.map((c: any) => (
                  <div key={c.id} style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--glass-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: "#475569" }}>
                      {c.user?.name ? c.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#0f172a", marginRight: "0.5rem" }}>
                        {c.user?.name || c.user?.email?.split('@')[0] || "User"}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#0f172a", lineHeight: "1.4" }}>
                        {c.content}
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "0.25rem" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#475569", marginTop: "2rem", fontStyle: "italic" }}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            <div style={{ padding: "1.5rem", borderTop: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "1rem" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => handleToggleLike(currentMedia.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: (currentMedia.likes?.length ?? 0) > 0 ? "#ef4444" : "#475569", transition: "transform 0.1s" }}
                    className="hover-scale"
                  >
                    <Heart size={24} fill={(currentMedia.likes?.length ?? 0) > 0 ? "currentColor" : "none"} strokeWidth={2} />
                  </button>
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#475569", transition: "transform 0.1s" }}
                    className="hover-scale"
                    onClick={() => document.getElementById("modalCommentInput")?.focus()}
                  >
                    <MessageCircle size={24} strokeWidth={2} />
                  </button>
                  <button
                    onClick={async () => {
                      const fullUrl = `${window.location.origin}/events/${eventId}/gallery#media-${currentMedia.id}`;
                      await navigator.clipboard.writeText(fullUrl);
                      alert("Link copied!");
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#475569", transition: "transform 0.1s" }}
                    className="hover-scale"
                    title="Share Link"
                  >
                    <Share2 size={24} strokeWidth={2} />
                  </button>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {currentUser && currentMedia.uploaderId === currentUser.id && (
                    <button
                      onClick={() => handleDeleteMedia(currentMedia.id)}
                      className="hover-scale"
                      style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s" }}
                      title="Delete Photo"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <a
                    href={`/api/download/${currentMedia.id}`}
                    className="hover-scale"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "#475569", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "transform 0.1s" }}
                    title="Download"
                    download
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>

              <div style={{ fontWeight: "bold", fontSize: "1rem", color: "#0f172a" }}>
                {currentMedia._count?.likes || currentMedia.likes?.length || 0} likes
              </div>

              <form onSubmit={(e) => { e.preventDefault(); postComment(e, currentMedia.id); }} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  id="modalCommentInput"
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "9999px", border: "1px solid var(--glass-border)", background: "var(--bg-secondary)", outline: "none", color: "#0f172a" }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  style={{ background: "none", border: "none", color: "#6366f1", fontWeight: "bold", cursor: newComment.trim() ? "pointer" : "default", opacity: newComment.trim() ? 1 : 0.5 }}
                >
                  Post
                </button>
              </form>

            </div>
          </div>
          </>
          );
        })()}
        </div>
        , document.body)}
    </div>
  );
}
