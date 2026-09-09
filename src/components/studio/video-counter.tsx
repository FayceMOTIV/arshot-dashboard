"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Film } from "lucide-react";
import type { PlanTier } from "@/types";
import { PLAN_VIDEO_LIMITS } from "@/types";

interface VideoCounterProps {
  plan: PlanTier;
  videosUsed: number;
}

export function VideoCounter({ plan, videosUsed }: VideoCounterProps) {
  const t = useTranslations("studio");
  const limit = PLAN_VIDEO_LIMITS[plan];
  const isUnlimited = limit === Infinity;
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - videosUsed);

  return (
    <Badge
      variant="secondary"
      className="gap-2 px-3 py-1.5 text-sm font-medium"
    >
      <Film className="h-4 w-4" />
      {isUnlimited
        ? t("videosUnlimited")
        : t("videosRemaining", { count: remaining })}
    </Badge>
  );
}
