"use client";

import { useEffect, useState, useRef } from "react";

interface ARViewerClientProps {
  shortId: string;
  apiUrl: string;
}

interface ModelData {
  id: string;
  name: string;
  glbUrl: string;
  usdzUrl: string | null;
  thumbnailUrl: string | null;
}

export function ARViewerClient({ shortId, apiUrl }: ARViewerClientProps) {
  const [model, setModel] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        const resp = await fetch(`${apiUrl}/models/by-short-id/${encodeURIComponent(shortId)}`);
        if (!resp.ok) throw new Error("Not found");
        const data: ModelData = await resp.json();
        if (!data.glbUrl) throw new Error("No model URL");
        setModel(data);

        // Track scan anonymously
        const ua = navigator.userAgent;
        const device = /iPhone|iPad/i.test(ua) ? "ios" : /Android/i.test(ua) ? "android" : "desktop";
        fetch(`${apiUrl}/scans/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelId: data.id, device, country: "" }),
        }).catch(() => {});
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadModel();
  }, [shortId, apiUrl]);

  useEffect(() => {
    if (!model || !viewerRef.current) return;

    const viewer = document.createElement("model-viewer");
    viewer.setAttribute("src", model.glbUrl);
    if (model.usdzUrl) viewer.setAttribute("ios-src", model.usdzUrl);
    viewer.setAttribute("alt", model.name || "Produit AR");
    viewer.setAttribute("ar", "");
    viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.style.width = "100%";
    viewer.style.maxWidth = "500px";
    viewer.style.height = "60vh";
    viewer.style.borderRadius = "16px";
    viewer.style.background = "white";
    viewer.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";

    viewerRef.current.appendChild(viewer);

    return () => {
      if (viewerRef.current?.contains(viewer)) {
        viewerRef.current.removeChild(viewer);
      }
    };
  }, [model]);

  const handleARClick = () => {
    if (!model?.usdzUrl) return;
    const ua = navigator.userAgent;
    if (/iPhone|iPad/i.test(ua)) {
      const link = document.createElement("a");
      link.rel = "ar";
      link.href = model.usdzUrl;
      const img = document.createElement("img");
      link.appendChild(img);
      link.click();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #E5E7EB",
            borderTopColor: "#0066FF",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#6B7280" }}>Chargement du modèle...</p>
      </div>
    );
  }

  if (error || !model) {
    return <p style={{ color: "#6B7280" }}>Modèle non trouvé</p>;
  }

  return (
    <>
      <div ref={viewerRef} />
      <button
        onClick={handleARClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
          padding: "16px 32px",
          background: "#0066FF",
          color: "white",
          border: "none",
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5" />
          <path d="M12 12v9" />
          <path d="M12 12L4 7.5" />
        </svg>
        Voir en AR
      </button>
    </>
  );
}
