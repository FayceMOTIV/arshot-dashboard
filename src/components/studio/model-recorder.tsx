"use client";

import { useEffect, useRef } from "react";

interface ModelRecorderProps {
  glbUrl: string;
  durationSeconds?: number;
  onProgress: (pct: number) => void;
  onDone: (blobUrl: string) => void;
  onError: (err: string) => void;
}

async function ensureModelViewerScript(): Promise<void> {
  if (customElements.get("model-viewer")) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Échec chargement model-viewer"));
    document.head.appendChild(script);
  });
}

/**
 * ModelRecorder — capture le canvas WebGL du model-viewer en rotation
 * et produit un blob URL vidéo (WebM) via l'API MediaRecorder du navigateur.
 * Zéro API externe, zéro coût.
 */
export function ModelRecorder({
  glbUrl,
  durationSeconds = 8,
  onProgress,
  onDone,
  onError,
}: ModelRecorderProps) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let viewer: HTMLElement | null = null;

    (async () => {
      try {
        await ensureModelViewerScript();

        viewer = document.createElement("model-viewer");
        viewer.setAttribute("src", glbUrl);
        viewer.setAttribute("auto-rotate", "");
        viewer.setAttribute("auto-rotate-delay", "0");
        viewer.setAttribute("rotation-per-second", "45deg"); // 360° en 8s
        viewer.setAttribute("exposure", "1.5");
        viewer.setAttribute("environment-image", "neutral");
        viewer.setAttribute("shadow-intensity", "0.5");
        // Off-screen mais dans le DOM pour que le rendu GPU fonctionne
        viewer.style.cssText =
          "position:fixed;top:-9999px;left:-9999px;width:720px;height:720px;";
        document.body.appendChild(viewer);

        await new Promise<void>((resolve, reject) => {
          viewer!.addEventListener("load", () => resolve(), { once: true });
          viewer!.addEventListener(
            "error",
            () => reject(new Error("Impossible de charger le modèle 3D")),
            { once: true }
          );
          setTimeout(
            () => reject(new Error("Timeout — modèle trop long à charger")),
            30_000
          );
        });

        // Laisser auto-rotate démarrer
        await new Promise((r) => setTimeout(r, 600));

        // model-viewer utilise un shadow DOM ouvert
        const shadow = (viewer as unknown as { shadowRoot: ShadowRoot })
          .shadowRoot;
        const canvas = shadow?.querySelector("canvas") as HTMLCanvasElement | null;
        if (!canvas) throw new Error("Canvas WebGL inaccessible (shadow DOM)");

        const mimeType =
          ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(
            (t) => MediaRecorder.isTypeSupported(t)
          ) ?? "";
        if (!mimeType)
          throw new Error("MediaRecorder non supporté sur ce navigateur (Chrome/Firefox requis)");

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 4_000_000,
        });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          if (viewer && document.body.contains(viewer))
            document.body.removeChild(viewer);
          const blob = new Blob(chunks, { type: mimeType });
          onDone(URL.createObjectURL(blob));
        };

        // Mise à jour de la progress bar toutes les 200ms
        const totalMs = durationSeconds * 1000;
        let elapsed = 0;
        const tick = 200;
        const timer = setInterval(() => {
          elapsed += tick;
          onProgress(Math.min(Math.round((elapsed / totalMs) * 100), 99));
        }, tick);

        recorder.start(200);
        setTimeout(() => {
          clearInterval(timer);
          recorder.stop();
        }, totalMs);
      } catch (err) {
        if (viewer && document.body.contains(viewer))
          document.body.removeChild(viewer);
        onError(err instanceof Error ? err.message : "Enregistrement échoué");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // purement impératif, pas de rendu
}
