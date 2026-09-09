"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { TrendBadge } from "@/components/studio/trend-badge";
import { cn } from "@/lib/utils";
import {
  Package,
  Magnet,
  Layers,
  SplitSquareHorizontal,
  RotateCw,
  Ear,
  Sparkles,
  Hand,
} from "lucide-react";
import type { VideoTemplateName } from "@/types";

interface TemplateCardProps {
  templateId: VideoTemplateName;
  selected: boolean;
  trending: boolean;
  onSelect: (id: VideoTemplateName) => void;
}

const TEMPLATE_ICONS: Record<VideoTemplateName, React.ElementType> = {
  unboxing: Package,
  levitation: Magnet,
  transform: Layers,
  before_after: SplitSquareHorizontal,
  "360_hype": RotateCw,
  asmr_closeup: Ear,
  quiet_luxury: Sparkles,
  pov_unboxing: Hand,
};

const TEMPLATE_I18N_KEYS: Record<VideoTemplateName, string> = {
  unboxing: "templateUnboxing",
  levitation: "templateLevitation",
  transform: "templateTransform",
  before_after: "templateBeforeAfter",
  "360_hype": "template360Hype",
  asmr_closeup: "templateAsmrCloseup",
  quiet_luxury: "templateQuietLuxury",
  pov_unboxing: "templatePovUnboxing",
};

export function TemplateCard({ templateId, selected, trending, onSelect }: TemplateCardProps) {
  const t = useTranslations("studio");
  const Icon = TEMPLATE_ICONS[templateId];
  const i18nKey = TEMPLATE_I18N_KEYS[templateId];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const label = t(i18nKey as any);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected
          ? "ring-2 ring-[#0066FF] bg-[#0066FF]/5"
          : "hover:ring-1 hover:ring-border"
      )}
      onClick={() => onSelect(templateId)}
    >
      <CardContent className="flex flex-col items-center gap-2 p-4">
        {trending && <TrendBadge />}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            selected
              ? "bg-[#0066FF] text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-center text-sm font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}
