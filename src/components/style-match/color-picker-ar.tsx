"use client";

import { useState, useRef, useCallback } from "react";

interface ColorPickerARProps {
  onColorPicked: (color: string, metalness: number, roughness: number) => void;
  apiUrl: string;
}

export function ColorPickerAR({ onColorPicked, apiUrl }: ColorPickerARProps) {
  const [active, setActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
    } catch {
      setError("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current) return;
    setAnalyzing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

      try {
        const resp = await fetch(`${apiUrl}/style/match-color`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: base64 }),
        });
        if (resp.ok) {
          const data = await resp.json();
          onColorPicked(data.dominantColor, data.metalness, data.roughness);
          stopCamera();
          return;
        }
      } catch {
        // API unavailable, fallback to local color extraction
      }

      // Fallback: extract dominant color from center pixels
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const imageData = ctx.getImageData(centerX - 5, centerY - 5, 10, 10);
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
      }
      const pixels = imageData.data.length / 4;
      const hex = `#${Math.round(r / pixels).toString(16).padStart(2, "0")}${Math.round(g / pixels).toString(16).padStart(2, "0")}${Math.round(b / pixels).toString(16).padStart(2, "0")}`;
      onColorPicked(hex, 0.3, 0.5);
      stopCamera();
    } catch {
      setError("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, [apiUrl, onColorPicked, stopCamera]);

  if (error) {
    return (
      <p style={{ color: "#EF4444", fontSize: 12, textAlign: "center", marginTop: 8 }}>
        {error}
      </p>
    );
  }

  if (!active) {
    return (
      <button
        onClick={startCamera}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 16px",
          border: "2px solid #E5E7EB",
          borderRadius: 24,
          background: "white",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          color: "#1F2937",
        }}
      >
        <span style={{ fontSize: 18 }}>{"\u{1F3A8}"}</span>
        Color Picker
      </button>
    );
  }

  return (
    <div style={{ position: "relative", marginTop: 12, textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          maxWidth: 300,
          borderRadius: 12,
          border: "2px solid #0066FF",
        }}
      />
      {/* Crosshair overlay */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 40,
          height: 40,
          border: "2px solid #0066FF",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={captureAndAnalyze}
          disabled={analyzing}
          style={{
            padding: "8px 20px",
            background: "#0066FF",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: analyzing ? "wait" : "pointer",
            opacity: analyzing ? 0.7 : 1,
          }}
        >
          {analyzing ? "Analyse..." : "Capturer"}
        </button>
        <button
          onClick={stopCamera}
          style={{
            padding: "8px 20px",
            background: "#EF4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
