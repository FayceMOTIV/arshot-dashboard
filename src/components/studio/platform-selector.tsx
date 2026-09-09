"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PublishPlatform } from "@/types";

interface PlatformSelectorProps {
  selected: PublishPlatform[];
  onChange: (platforms: PublishPlatform[]) => void;
}

const PLATFORMS: { id: PublishPlatform; label: string; color: string; icon: string }[] = [
  { id: "tiktok", label: "TikTok", color: "bg-black text-white", icon: "T" },
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", icon: "I" },
  { id: "pinterest", label: "Pinterest", color: "bg-red-600 text-white", icon: "P" },
];

export function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const t = useTranslations("studio");

  const toggle = (platform: PublishPlatform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{t("platforms")}</label>
      <div className="flex gap-3">
        {PLATFORMS.map(({ id, label, color, icon }) => {
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                isSelected
                  ? "border-[#0066FF] shadow-sm"
                  : "border-border opacity-50 hover:opacity-75"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                  color
                )}
              >
                {icon}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
