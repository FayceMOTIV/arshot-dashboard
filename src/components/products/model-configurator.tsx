"use client";

import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw, Palette, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelConfiguratorProps {
  src: string;
  alt: string;
  iosSrc?: string;
}

const COLOR_SWATCHES = [
  { name: "Blanc", hex: "#FFFFFF" },
  { name: "Noir", hex: "#1A1A1A" },
  { name: "Beige", hex: "#F5F0E8" },
  { name: "Marine", hex: "#1B3A6B" },
  { name: "Bordeaux", hex: "#7C2D3C" },
  { name: "Vert forêt", hex: "#2D5A3D" },
  { name: "Or", hex: "#D4A843" },
  { name: "Argent", hex: "#A8A9AD" },
  { name: "Terracotta", hex: "#C4714A" },
  { name: "Bleu ardoise", hex: "#4A6B8A" },
  { name: "Corail", hex: "#E8735A" },
  { name: "Minuit", hex: "#1A2B4A" },
];

type BgType = "transparent" | "white" | "neutral";

type ModelViewerElement = HTMLElement & {
  model?: {
    materials?: {
      pbrMetallicRoughness: {
        setBaseColorFactor: (factor: number[]) => void;
      };
    }[];
  };
};

export function ModelConfigurator({ src, alt, iosSrc }: ModelConfiguratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [exposure, setExposure] = useState(1.0);
  const [bg, setBg] = useState<BgType>("transparent");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    const viewer = document.createElement("model-viewer") as ModelViewerElement;
    viewer.setAttribute("src", src);
    viewer.setAttribute("alt", alt);
    viewer.setAttribute("style", "width:100%;height:100%");
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("interaction-prompt", "none");
    viewer.setAttribute("shadow-intensity", "1");
    viewer.setAttribute("environment-image", "neutral");
    viewer.setAttribute("exposure", "1");
    if (iosSrc) viewer.setAttribute("ios-src", iosSrc);

    container.appendChild(viewer);
    viewerRef.current = viewer;

    return () => {
      if (container.contains(viewer)) container.removeChild(viewer);
      viewerRef.current = null;
    };
  }, [src, alt, iosSrc]);

  const applyColor = (hex: string) => {
    setSelectedColor(hex);
    const viewer = viewerRef.current;
    if (!viewer) return;

    const applyMat = () => {
      const mat = viewer.model?.materials?.[0];
      if (mat) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
      }
    };

    if (viewer.model) {
      applyMat();
    } else {
      viewer.addEventListener("load", applyMat, { once: true });
    }
  };

  const applyExposure = (val: number) => {
    setExposure(val);
    viewerRef.current?.setAttribute("exposure", String(val));
  };

  const applyBg = (type: BgType) => {
    setBg(type);
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (type === "white") {
      viewer.setAttribute("style", "width:100%;height:100%;background:#ffffff;");
    } else if (type === "neutral") {
      viewer.setAttribute("style", "width:100%;height:100%;background:#F5F5F5;");
    } else {
      viewer.setAttribute("style", "width:100%;height:100%;");
    }
  };

  const handleReset = () => {
    setSelectedColor(null);
    setExposure(1.0);
    setBg("transparent");
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setAttribute("exposure", "1");
    viewer.setAttribute("style", "width:100%;height:100%");
    const mat = viewer.model?.materials?.[0];
    if (mat) mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Viewer */}
      <div className="lg:col-span-2 relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Configurator Panel */}
      <div className="space-y-5">
        {/* Colors */}
        <div>
          <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Palette className="h-4 w-4 text-[#0066FF]" />
            Couleur
          </Label>
          <div className="grid grid-cols-6 gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => applyColor(c.hex)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-all hover:scale-110",
                  selectedColor === c.hex
                    ? "border-[#0066FF] ring-2 ring-[#0066FF]/40 scale-110"
                    : "border-transparent hover:border-muted-foreground/40"
                )}
                style={{
                  backgroundColor: c.hex,
                  boxShadow:
                    c.hex === "#FFFFFF"
                      ? "inset 0 0 0 1px #e5e7eb"
                      : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Exposure */}
        <div>
          <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Sun className="h-4 w-4 text-amber-500" />
            Luminosité — {exposure.toFixed(1)}
          </Label>
          <Slider
            min={0.5}
            max={2.5}
            step={0.1}
            value={[exposure]}
            onValueChange={([v]) => applyExposure(v)}
            className="w-full"
          />
        </div>

        {/* Background */}
        <div>
          <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Monitor className="h-4 w-4 text-purple-500" />
            Fond
          </Label>
          <div className="flex gap-2 flex-wrap">
            {(["transparent", "white", "neutral"] as BgType[]).map((type) => (
              <button
                key={type}
                onClick={() => applyBg(type)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                  bg === type
                    ? "border-[#0066FF] bg-[#0066FF]/10 text-[#0066FF]"
                    : "border-border text-muted-foreground hover:border-[#0066FF]/40"
                )}
              >
                {type === "transparent"
                  ? "Transparent"
                  : type === "white"
                  ? "Blanc"
                  : "Neutre"}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
