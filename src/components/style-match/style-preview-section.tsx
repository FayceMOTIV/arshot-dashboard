"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Lock } from "lucide-react";

interface StylePreviewSectionProps {
  productId: string;
  enabled?: boolean;
}

const STYLE_PREVIEWS = [
  {
    id: "scandinavian",
    color: "#E8DCC8",
    label: "scandinavian",
  },
  {
    id: "industrial",
    color: "#4A4A4A",
    label: "industrial",
  },
  {
    id: "luxury",
    color: "#C9A96E",
    label: "luxury",
  },
  {
    id: "bohemian",
    color: "#A0522D",
    label: "bohemian",
  },
];

export function StylePreviewSection({ productId, enabled = true }: StylePreviewSectionProps) {
  const t = useTranslations("styleMatch");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
          <Palette className="h-5 w-5 text-[#0066FF]" />
          {t("preview")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enabled ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STYLE_PREVIEWS.map((style) => (
                <div
                  key={style.id}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-3"
                >
                  <div
                    className="h-16 w-16 rounded-lg shadow-inner"
                    style={{ backgroundColor: style.color }}
                  />
                  <span className="text-xs font-medium">
                    {t(style.label as "scandinavian" | "industrial" | "luxury" | "bohemian")}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {t("mostUsedStyle", { style: t("scandinavian"), percentage: "67" })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("requiresGrowth")}</p>
            <Button variant="outline" size="sm" className="gap-2">
              {t("enableStyleMatch")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
