"use client";

import type { VideoTemplateName } from "@/types";

interface BreakoutEffectPreviewProps {
  glbUrl?: string;
  template: VideoTemplateName;
  productName?: string;
}

const TEMPLATE_CONFIG: Record<
  VideoTemplateName,
  { bg: string; accent: string; label: string }
> = {
  "360_hype": {
    bg: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
    accent: "#ff3366",
    label: "360° HYPE",
  },
  levitation: {
    bg: "linear-gradient(180deg, #f5f0eb 0%, #e8e0d5 100%)",
    accent: "#8b7355",
    label: "LEVITATION",
  },
  quiet_luxury: {
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
    accent: "#c4a35a",
    label: "QUIET LUXURY",
  },
  unboxing: {
    bg: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)",
    accent: "#0066FF",
    label: "UNBOXING",
  },
  transform: {
    bg: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
    accent: "#58a6ff",
    label: "TRANSFORM",
  },
  before_after: {
    bg: "linear-gradient(90deg, #f8f8f8 50%, #e8e8e8 50%)",
    accent: "#333333",
    label: "BEFORE / AFTER",
  },
  asmr_closeup: {
    bg: "linear-gradient(180deg, #f0ede8 0%, #e5e0d8 100%)",
    accent: "#c0392b",
    label: "ASMR",
  },
  pov_unboxing: {
    bg: "linear-gradient(180deg, #faf8f5 0%, #f0ece5 100%)",
    accent: "#2c3e50",
    label: "POV",
  },
};

export function BreakoutEffectPreview({
  template,
  productName,
}: BreakoutEffectPreviewProps) {
  const config = TEMPLATE_CONFIG[template] ?? TEMPLATE_CONFIG["360_hype"];

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: config.bg, minHeight: 180 }}
    >
      {/* Template-specific CSS animations */}
      {template === "360_hype" && <Hype360Effect accent={config.accent} />}
      {template === "levitation" && <LevitationEffect accent={config.accent} />}
      {template === "quiet_luxury" && (
        <QuietLuxuryEffect accent={config.accent} name={productName} />
      )}
      {template === "unboxing" && <UnboxingEffect accent={config.accent} />}
      {template === "transform" && <TransformEffect accent={config.accent} />}
      {template === "before_after" && <BeforeAfterEffect />}
      {template === "asmr_closeup" && <ASMREffect />}
      {template === "pov_unboxing" && <POVUnboxingEffect />}

      {/* Template label */}
      <div
        className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase"
        style={{
          background: `${config.accent}cc`,
          color: "#fff",
        }}
      >
        {config.label}
      </div>
    </div>
  );
}

/* ========== 360° HYPE ========== */
function Hype360Effect({ accent }: { accent: string }) {
  return (
    <>
      {/* Spinning ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-24 h-24 rounded-full border-2 animate-spin"
          style={{
            borderColor: `${accent}40`,
            borderTopColor: accent,
            animationDuration: "2s",
          }}
        />
      </div>
      {/* Inner pulsing circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full animate-pulse"
          style={{ background: `${accent}30` }}
        />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      {/* Lens flare */}
      <div
        className="absolute top-4 right-4 w-6 h-6 rounded-full blur-sm animate-pulse"
        style={{ background: `${accent}40` }}
      />
      {/* Orbit dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-28 h-28 animate-spin"
          style={{ animationDuration: "4s" }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ background: accent }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full opacity-50"
            style={{ background: accent }}
          />
        </div>
      </div>
    </>
  );
}

/* ========== LEVITATION ========== */
function LevitationEffect({ accent }: { accent: string }) {
  return (
    <>
      {/* Floating object */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-bounce" style={{ animationDuration: "3s" }}>
          <div
            className="w-16 h-16 rounded-xl rotate-12"
            style={{
              background: `linear-gradient(135deg, ${accent}60, ${accent}20)`,
              boxShadow: `0 20px 40px ${accent}30`,
            }}
          />
        </div>
      </div>
      {/* Shadow below */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full bg-black/10 blur-md animate-pulse" />
      {/* Sparkle particles */}
      <div
        className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full animate-ping"
        style={{ background: accent, animationDuration: "2s" }}
      />
      <div
        className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full animate-ping"
        style={{
          background: accent,
          animationDuration: "3s",
          animationDelay: "1s",
        }}
      />
    </>
  );
}

/* ========== QUIET LUXURY ========== */
function QuietLuxuryEffect({
  accent,
  name,
}: {
  accent: string;
  name?: string;
}) {
  return (
    <>
      {/* Elegant gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      {/* Subtle animated line */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-20 h-[1px] animate-pulse"
          style={{ background: `${accent}60`, animationDuration: "4s" }}
        />
      </div>
      {/* Diamond shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-10 h-10 rotate-45 border animate-pulse"
          style={{
            borderColor: `${accent}40`,
            animationDuration: "5s",
          }}
        />
      </div>
      {/* Product name */}
      <div
        className="absolute bottom-8 left-0 right-0 text-center text-[10px] tracking-[0.3em] uppercase"
        style={{ color: `${accent}90` }}
      >
        {name || "Quiet Luxury"}
      </div>
    </>
  );
}

/* ========== UNBOXING ========== */
function UnboxingEffect({ accent }: { accent: string }) {
  return (
    <>
      {/* Box lid animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Box bottom */}
        <div
          className="w-20 h-14 rounded-b-lg border-2 border-t-0"
          style={{ borderColor: `${accent}40` }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Box lid - animated */}
        <div
          className="w-22 h-4 -mt-16 rounded-t-md animate-bounce"
          style={{
            background: `${accent}20`,
            border: `2px solid ${accent}40`,
            animationDuration: "2s",
          }}
        />
      </div>
      {/* Confetti dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full animate-ping"
          style={{
            background: [accent, "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b"][i],
            top: `${20 + Math.sin(i * 1.5) * 25}%`,
            left: `${15 + i * 13}%`,
            animationDuration: `${1.5 + i * 0.3}s`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      {/* Badge */}
      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-gray-600">
        UNBOXING
      </div>
    </>
  );
}

/* ========== TRANSFORM ========== */
function TransformEffect({ accent }: { accent: string }) {
  return (
    <>
      {/* Morphing shapes */}
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        <div
          className="w-8 h-8 rounded animate-spin"
          style={{
            background: `${accent}30`,
            animationDuration: "6s",
          }}
        />
        <div
          className="w-3 h-8 animate-pulse"
          style={{ background: `${accent}20` }}
        />
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{
            background: `${accent}30`,
            animationDuration: "4s",
            animationDirection: "reverse",
          }}
        />
      </div>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${accent}10, transparent, ${accent}10)`,
          animationDuration: "3s",
        }}
      />
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-current" style={{ color: accent }} />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-current" style={{ color: accent }} />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-current" style={{ color: accent }} />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-current" style={{ color: accent }} />
      </div>
    </>
  );
}

/* ========== BEFORE / AFTER ========== */
function BeforeAfterEffect() {
  return (
    <>
      {/* Split line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/20" />
      {/* Arrow handles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-0">
        <div className="w-5 h-5 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center">
          <span className="text-[8px] text-gray-500">◀▶</span>
        </div>
      </div>
      {/* Before label */}
      <div className="absolute top-3 left-3 text-[9px] font-medium text-gray-400 uppercase tracking-wider">
        Before
      </div>
      {/* After label */}
      <div className="absolute top-3 right-3 text-[9px] font-medium text-gray-400 uppercase tracking-wider">
        After
      </div>
      {/* Left side fade */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-black/5" />
    </>
  );
}

/* ========== ASMR CLOSE-UP ========== */
function ASMREffect() {
  return (
    <>
      {/* Zoom rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-32 h-32 rounded-full border border-black/5 animate-ping"
          style={{ animationDuration: "3s" }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-20 h-20 rounded-full border border-black/10 animate-ping"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-black/5" />
      </div>
      {/* Recording indicator */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] text-gray-500 font-medium">REC</span>
      </div>
      {/* Sound wave bars */}
      <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-4">
        {[3, 6, 4, 8, 5, 7, 3].map((h, i) => (
          <div
            key={i}
            className="w-0.5 bg-gray-300 rounded-full animate-pulse"
            style={{
              height: `${h * 2}px`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1.5s",
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ========== POV UNBOXING ========== */
function POVUnboxingEffect() {
  return (
    <>
      {/* Hand silhouette effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-t from-black/15 to-transparent rounded-t-full" />
      {/* Box shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-14 border-2 border-dashed border-gray-300 rounded-lg animate-pulse" style={{ animationDuration: "2.5s" }}>
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg">📦</span>
          </div>
        </div>
      </div>
      {/* POV frame corners */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-gray-400/40 rounded-tl" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-gray-400/40 rounded-tr" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-gray-400/40 rounded-bl" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-gray-400/40 rounded-br" />
      {/* Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-white">
        POV
      </div>
    </>
  );
}
