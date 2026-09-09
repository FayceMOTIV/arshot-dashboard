"use client";

import { useState } from "react";

interface StyleButtonsProps {
  onStyleChange: (style: string, config: StyleConfig) => void;
}

interface StyleConfig {
  baseColor: string;
  metalness: number;
  roughness: number;
}

const STYLES: { id: string; label: string; emoji: string; config: StyleConfig }[] = [
  {
    id: "scandinavian",
    label: "Scandinave",
    emoji: "\u{1F3D4}",
    config: { baseColor: "#E8DCC8", metalness: 0.1, roughness: 0.8 },
  },
  {
    id: "industrial",
    label: "Industriel",
    emoji: "\u{2699}",
    config: { baseColor: "#4A4A4A", metalness: 0.8, roughness: 0.3 },
  },
  {
    id: "luxury",
    label: "Luxe",
    emoji: "\u{1F451}",
    config: { baseColor: "#C9A96E", metalness: 0.6, roughness: 0.2 },
  },
  {
    id: "bohemian",
    label: "Boh\u00E8me",
    emoji: "\u{1F33F}",
    config: { baseColor: "#A0522D", metalness: 0.1, roughness: 0.9 },
  },
];

export function StyleButtons({ onStyleChange }: StyleButtonsProps) {
  const [activeStyle, setActiveStyle] = useState<string | null>(null);

  const handleClick = (style: (typeof STYLES)[number]) => {
    setActiveStyle(style.id);
    onStyleChange(style.id, style.config);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: 16,
      }}
    >
      {STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => handleClick(style)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            border: activeStyle === style.id ? "2px solid #0066FF" : "2px solid #E5E7EB",
            borderRadius: 24,
            background: activeStyle === style.id ? "rgba(0,102,255,0.08)" : "white",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            color: "#1F2937",
          }}
        >
          <span style={{ fontSize: 18 }}>{style.emoji}</span>
          {style.label}
        </button>
      ))}
    </div>
  );
}
