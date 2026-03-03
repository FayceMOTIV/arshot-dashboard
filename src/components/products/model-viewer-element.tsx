"use client";

import { useEffect, useRef } from "react";

interface ModelViewerElementProps {
  src: string;
  alt: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
}

export function ModelViewerElement({
  src,
  alt,
  className = "w-full h-full",
  autoRotate = true,
  cameraControls = true,
}: ModelViewerElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewer = document.createElement("model-viewer");
    viewer.setAttribute("src", src);
    viewer.setAttribute("alt", alt);
    viewer.setAttribute("style", "width:100%;height:100%");
    viewer.setAttribute("interaction-prompt", "none");

    if (autoRotate) viewer.setAttribute("auto-rotate", "");
    if (cameraControls) viewer.setAttribute("camera-controls", "");

    container.appendChild(viewer);

    return () => {
      container.removeChild(viewer);
    };
  }, [src, alt, autoRotate, cameraControls]);

  return <div ref={containerRef} className={className} />;
}
