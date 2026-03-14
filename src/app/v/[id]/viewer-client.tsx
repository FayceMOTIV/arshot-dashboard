"use client";

import { useEffect, useRef, useState } from "react";

interface ViewerData {
  model_id: string;
  name: string;
  glb_url: string | null;
  usdz_url: string | null;
  thumbnail_url: string | null;
  branding: "watermark" | "badge" | "none";
  app_url: string;
  viewer_settings: { auto_rotate: boolean; ar: boolean; bg_color: string };
}

interface Props {
  data: ViewerData;
  modelId: string;
}

export function ViewerClient({ data, modelId }: Props) {
  const tracked = useRef(false);
  const [arOverlay, setArOverlay] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Track view
    fetch("/api/v1/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_id: modelId, event: "view", referrer: document.referrer || "" }),
    }).catch(() => {});

    // Load model-viewer script
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    // Check for ?ar=true — show interstitial
    const params = new URLSearchParams(window.location.search);
    if (params.get("ar") === "true") {
      setArOverlay(true);
    }
  }, [modelId]);

  const handleModelLoad = () => setModelLoaded(true);

  const launchAR = () => {
    setArOverlay(false);
    const mv = document.querySelector("model-viewer") as (HTMLElement & { activateAR(): void }) | null;
    try { mv?.activateAR(); } catch {}
    // Track AR click
    fetch("/api/v1/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_id: modelId, event: "ar", referrer: "" }),
    }).catch(() => {});
  };

  const showBranding = data.branding === "watermark" || data.branding === "badge";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5" }}>
      {/* ── AR Auto-launch Interstitial ── */}
      {arOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "linear-gradient(150deg, #0066FF 0%, #0044cc 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 72 }}>📱</div>
          <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, maxWidth: 280, lineHeight: 1.3 }}>
            {data.name}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", maxWidth: 260, lineHeight: 1.5 }}>
            Visualisez ce produit dans votre espace en réalité augmentée
          </p>
          <button
            disabled={!modelLoaded}
            onClick={launchAR}
            style={{
              padding: "18px 44px",
              background: "#fff",
              color: "#0066FF",
              border: "none",
              borderRadius: 100,
              fontSize: "1.15rem",
              fontWeight: 700,
              cursor: modelLoaded ? "pointer" : "not-allowed",
              opacity: modelLoaded ? 1 : 0.65,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            {modelLoaded ? "✨ Lancer la réalité augmentée" : "⏳ Chargement du modèle…"}
          </button>
          <button
            onClick={() => setArOverlay(false)}
            style={{ color: "rgba(255,255,255,0.65)", background: "none", border: "none", fontSize: "0.9rem", cursor: "pointer", padding: 8 }}
          >
            Voir en 3D d'abord →
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <span style={{ color: "#111", fontWeight: 600, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
          {data.name}
        </span>
        {showBranding && (
          <a
            href={data.app_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.75rem", color: "#999", textDecoration: "none", flexShrink: 0 }}
          >
            Powered by ARShot
          </a>
        )}
      </div>

      {/* Viewer */}
      <div style={{ flex: 1, position: "relative" }}>
        <model-viewer
          src={data.glb_url ?? undefined}
          ios-src={data.usdz_url ?? undefined}
          alt={data.name}
          ar={data.viewer_settings.ar}
          ar-modes="webxr scene-viewer quick-look"
          auto-rotate={data.viewer_settings.auto_rotate}
          camera-controls
          exposure="1.5"
          shadow-intensity="0.5"
          environment-image="neutral"
          poster={data.thumbnail_url ?? undefined}
          onLoad={handleModelLoad}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "calc(100dvh - 56px - 72px)",
            background: "#ffffff",
          }}
        >
          {/* AR button — model-viewer le masque automatiquement si AR non supporté */}
          <button
            slot="ar-button"
            onClick={() => {
              fetch("/api/v1/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model_id: modelId, event: "ar", referrer: "" }),
              }).catch(() => {});
            }}
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "14px 28px",
              background: "#0066FF",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,102,255,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            Voir en Réalité Augmentée 🪄
          </button>
        </model-viewer>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 20px",
          background: "rgba(255,255,255,0.95)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ color: "#111", fontSize: "0.9rem", fontWeight: 600 }}>{data.name}</p>
          <p style={{ color: "#888", fontSize: "0.75rem" }}>Expérience 3D interactive</p>
        </div>
        {showBranding && (
          <a
            href={data.app_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.8rem", background: "#0066FF", color: "#fff", padding: "8px 16px", borderRadius: 20, textDecoration: "none", fontWeight: 600 }}
          >
            Créer le vôtre →
          </a>
        )}
      </div>
    </div>
  );
}
