"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Track view (fire and forget)
    fetch("/api/v1/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model_id: modelId,
        event: "view",
        referrer: document.referrer || "",
      }),
    }).catch(() => {});

    // Load model-viewer script
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, [modelId]);

  const showBranding = data.branding === "watermark" || data.branding === "badge";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: data.viewer_settings.bg_color || "#0A0A0A" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-semibold text-sm truncate max-w-[200px]">
          {data.name}
        </span>
        {showBranding && (
          <a
            href={data.app_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors shrink-0"
          >
            Powered by ARShot
          </a>
        )}
      </div>

      {/* Viewer */}
      <div className="flex-1 relative">
        <model-viewer
          src={data.glb_url ?? undefined}
          ios-src={data.usdz_url ?? undefined}
          alt={data.name}
          ar={data.viewer_settings.ar}
          ar-modes="webxr scene-viewer quick-look"
          auto-rotate={data.viewer_settings.auto_rotate}
          camera-controls
          shadow-intensity="1"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "calc(100vh - 56px - 64px)",
            background: "transparent",
          }}
          poster={data.thumbnail_url ?? undefined}
        >
          {data.usdz_url && (
            <button
              slot="ar-button"
              onClick={() => {
                fetch("/api/v1/analytics/track", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ model_id: modelId, event: "ar", referrer: "" }),
                }).catch(() => {});
              }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full shadow-lg hover:bg-white/90 transition-colors"
            >
              Voir en Réalité Augmentée 🪄
            </button>
          )}
        </model-viewer>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-white/10 px-4 py-4 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <div>
          <p className="text-white text-sm font-medium">{data.name}</p>
          <p className="text-white/40 text-xs">Expérience 3D interactive</p>
        </div>
        {showBranding && (
          <a
            href={data.app_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors"
          >
            Créer le vôtre →
          </a>
        )}
      </div>
    </div>
  );
}
