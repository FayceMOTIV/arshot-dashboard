"use client";

import { useEffect, useRef, useCallback } from "react";
import { StyleButtons } from "@/components/style-match/style-buttons";
import { DayNightToggle } from "@/components/style-match/day-night-toggle";

interface ProductData {
  id: string;
  name: string;
  glbUrl: string | null;
  usdzUrl: string | null;
  thumbnailUrl: string | null;
}

interface ARViewerClientProps {
  shortId: string;
  productData: ProductData | null;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0.8, 0.8, 0.8];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

export function ARViewerClient({ shortId, productData }: ARViewerClientProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!productData?.glbUrl || !viewerRef.current) return;

    const viewer = document.createElement("model-viewer");
    viewer.setAttribute("src", productData.glbUrl);
    if (productData.usdzUrl) viewer.setAttribute("ios-src", productData.usdzUrl);
    viewer.setAttribute("alt", productData.name || "Produit AR");
    viewer.setAttribute("ar", "");
    viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("shadow-intensity", "1");
    viewer.setAttribute("environment-image", "neutral");
    viewer.style.width = "100%";
    viewer.style.maxWidth = "500px";
    viewer.style.height = "60vh";
    viewer.style.borderRadius = "16px";
    viewer.style.background = "white";
    viewer.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";

    // AR button as slot inside model-viewer — model-viewer handles AR activation
    // On iOS: uses ios-src (USDZ) → opens AR Quick Look natively
    // On Android: uses WebXR / Scene Viewer
    // On desktop: button is hidden automatically
    const arButton = document.createElement("button");
    arButton.setAttribute("slot", "ar-button");
    arButton.textContent = "📱 Voir dans mon espace";
    arButton.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;gap:8px;" +
      "padding:14px 28px;background:#0066FF;color:white;border:none;border-radius:50px;" +
      "font-size:16px;font-weight:600;cursor:pointer;position:absolute;bottom:16px;" +
      "left:50%;transform:translateX(-50%);box-shadow:0 4px 16px rgba(0,102,255,0.3);z-index:10;";
    viewer.appendChild(arButton);

    viewerRef.current.appendChild(viewer);
    viewerElementRef.current = viewer;

    return () => {
      if (viewerRef.current?.contains(viewer)) {
        viewerRef.current.removeChild(viewer);
      }
      viewerElementRef.current = null;
    };
  }, [productData]);

  const applyMaterial = useCallback(
    (color: string, metalness: number, roughness: number) => {
      const viewer = viewerElementRef.current;
      if (!viewer) return;
      try {
        const mv = viewer as unknown as {
          model?: {
            materials: Array<{
              pbrMetallicRoughness: {
                setBaseColorFactor: (rgba: [number, number, number, number]) => void;
                setMetallicFactor: (v: number) => void;
                setRoughnessFactor: (v: number) => void;
              };
            }>;
          };
        };
        const materials = mv.model?.materials;
        if (!materials?.length) return;
        const [r, g, b] = hexToRgb(color);
        materials[0].pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
        materials[0].pbrMetallicRoughness.setMetallicFactor(metalness);
        materials[0].pbrMetallicRoughness.setRoughnessFactor(roughness);
      } catch {
        // Material API not available on this model
      }
    },
    []
  );

  const handleStyleChange = useCallback(
    (_style: string, config: { baseColor: string; metalness: number; roughness: number }) => {
      applyMaterial(config.baseColor, config.metalness, config.roughness);
    },
    [applyMaterial]
  );

  const handleDayNightToggle = useCallback(
    (isNight: boolean) => {
      if (isNight) {
        applyMaterial("#2C3E50", 0.7, 0.2);
      } else {
        applyMaterial("#E8DCC8", 0.3, 0.6);
      }
    },
    [applyMaterial]
  );

  if (!productData || !productData.glbUrl) {
    return <p style={{ color: "#6B7280" }}>Modèle non trouvé</p>;
  }

  return (
    <>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        {productData.name}
      </h2>

      <div ref={viewerRef} />

      {/* Style Match */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Style Match
        </p>

        <StyleButtons onStyleChange={handleStyleChange} />

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <DayNightToggle onToggle={handleDayNightToggle} />
        </div>
      </div>
    </>
  );
}
