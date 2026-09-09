"use client";

import { useEffect, useRef, useState } from "react";

interface ModelViewerElementProps {
  src: string;
  alt: string;
  iosSrc?: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
}

export default function ModelViewerElement({
  src,
  alt,
  iosSrc,
  className = "w-full h-full",
  autoRotate = true,
  cameraControls = true,
  ar = false,
}: ModelViewerElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load model-viewer script once (v3.4.0 stable)
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    let viewer: HTMLElement | null = null;

    try {
      viewer = document.createElement("model-viewer");
      viewer.setAttribute("src", src);
      viewer.setAttribute("alt", alt);
      viewer.setAttribute("style", "width:100%;height:100%");
      viewer.setAttribute("interaction-prompt", "none");
      viewer.setAttribute("shadow-intensity", "1");
      viewer.setAttribute("environment-image", "neutral");

      if (iosSrc) viewer.setAttribute("ios-src", iosSrc);
      if (autoRotate) viewer.setAttribute("auto-rotate", "");
      if (cameraControls) viewer.setAttribute("camera-controls", "");
      if (ar) {
        viewer.setAttribute("ar", "");
        viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
        const arButton = document.createElement("button");
        arButton.setAttribute("slot", "ar-button");
        arButton.textContent = "Voir en AR";
        arButton.style.cssText =
          "padding:8px 16px;background:#0066FF;color:white;border:none;border-radius:8px;" +
          "font-size:14px;font-weight:600;cursor:pointer;position:absolute;bottom:12px;" +
          "left:50%;transform:translateX(-50%);box-shadow:0 2px 8px rgba(0,0,0,0.15);";
        viewer.appendChild(arButton);
      }

      container.appendChild(viewer);
    } catch {
      setError(true);
    }

    return () => {
      if (viewer && container.contains(viewer)) {
        container.removeChild(viewer);
      }
    };
  }, [src, alt, iosSrc, autoRotate, cameraControls, ar]);

  if (error) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: "center", padding: 24, color: "#666" }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Aperçu 3D indisponible
          </p>
          <p style={{ fontSize: 12 }}>
            Le viewer 3D nécessite WebGL. Essayez sur mobile ou un autre
            navigateur.
          </p>
          {src && (
            <a
              href={src}
              download
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "8px 16px",
                background: "#0066FF",
                color: "white",
                borderRadius: 8,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Télécharger le modèle 3D
            </a>
          )}
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
