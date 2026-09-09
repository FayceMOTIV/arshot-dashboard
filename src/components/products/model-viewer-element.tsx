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
  variantName?: string;
}

export default function ModelViewerElement({
  src,
  alt,
  iosSrc,
  className = "w-full h-full",
  autoRotate = true,
  cameraControls = true,
  ar = false,
  variantName,
}: ModelViewerElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load model-viewer script once (v3.4.0 stable)
    // Match the CDN URL exactly — app chunks also contain "model-viewer" in their name.
    if (!document.querySelector('script[src*="ajax/libs/model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    let viewer: HTMLElement | null = null;
    let cancelled = false;

    const mount = async () => {
      // Attendre que l'element custom soit defini avant d'en creer une instance :
      // sinon, selon le timing du chunk, le viewer peut rester vide (reveal).
      try {
        await customElements.whenDefined("model-viewer");
      } catch {
        setError(true);
        return;
      }
      if (cancelled || !containerRef.current) return;

      try {
        viewer = document.createElement("model-viewer");
      viewer.setAttribute("src", src);
      viewer.setAttribute("alt", alt);
      viewer.setAttribute("style", "width:100%;height:100%");
      viewer.setAttribute("interaction-prompt", "none");
      viewer.setAttribute("shadow-intensity", "1");
      viewer.setAttribute("environment-image", "neutral");

      if (iosSrc) viewer.setAttribute("ios-src", iosSrc);
      if (variantName) viewer.setAttribute("variant-name", variantName);
      if (autoRotate) viewer.setAttribute("auto-rotate", "");
      if (cameraControls) viewer.setAttribute("camera-controls", "");
      if (ar) {
        viewer.setAttribute("ar", "");
        viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
        const arButton = document.createElement("button");
        arButton.setAttribute("slot", "ar-button");
        arButton.textContent = "Voir en AR";
        arButton.style.cssText =
          "padding:8px 18px;background:#16130E;color:#FAF8F3;border:none;border-radius:999px;" +
          "font-size:13px;font-weight:600;cursor:pointer;position:absolute;bottom:12px;" +
          "left:50%;transform:translateX(-50%);box-shadow:0 2px 10px rgba(22,19,14,0.25);";
        viewer.appendChild(arButton);
      }

      containerRef.current?.appendChild(viewer);
      } catch {
        setError(true);
      }
    };

    mount();

    return () => {
      cancelled = true;
      if (viewer && viewer.parentNode) {
        viewer.parentNode.removeChild(viewer);
      }
    };
  }, [src, alt, iosSrc, autoRotate, cameraControls, ar, variantName]);

  if (error) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF8F3",
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: "center", padding: 24, color: "#6f6a5e" }}>
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
                background: "#16130E",
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
