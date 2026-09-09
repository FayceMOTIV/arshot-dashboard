"use client";

import { useState } from "react";

interface DayNightToggleProps {
  onToggle: (isNight: boolean) => void;
}

export function DayNightToggle({ onToggle }: DayNightToggleProps) {
  const [isNight, setIsNight] = useState(false);

  const handleToggle = () => {
    const next = !isNight;
    setIsNight(next);
    onToggle(next);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        border: "2px solid #E5E7EB",
        borderRadius: 24,
        background: isNight ? "#1E293B" : "white",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        color: isNight ? "#F8FAFC" : "#1F2937",
        transition: "all 0.3s ease",
      }}
    >
      <span
        style={{
          fontSize: 20,
          transition: "transform 0.3s ease",
          transform: isNight ? "rotate(180deg)" : "rotate(0deg)",
          display: "inline-block",
        }}
      >
        {isNight ? "\u{1F319}" : "\u{2600}"}
      </span>
      {isNight ? "Nuit" : "Jour"}
    </button>
  );
}
