"use client";

import { useTranslations } from "next-intl";
import { TemplateCard } from "@/components/studio/template-card";
import type { VideoTemplateName } from "@/types";

interface TemplateGridProps {
  selectedTemplate: VideoTemplateName | null;
  trendingTemplate: VideoTemplateName | null;
  onSelect: (id: VideoTemplateName) => void;
}

const ALL_TEMPLATES: VideoTemplateName[] = [
  "unboxing",
  "levitation",
  "transform",
  "before_after",
  "360_hype",
  "asmr_closeup",
  "quiet_luxury",
  "pov_unboxing",
];

export function TemplateGrid({ selectedTemplate, trendingTemplate, onSelect }: TemplateGridProps) {
  const t = useTranslations("studio");

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        {t("templates")}
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ALL_TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl}
            templateId={tpl}
            selected={selectedTemplate === tpl}
            trending={trendingTemplate === tpl}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
