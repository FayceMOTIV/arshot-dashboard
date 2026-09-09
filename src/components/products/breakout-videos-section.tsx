"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { getProductBreakouts } from "@/lib/api";
import { BreakoutEffectPreview } from "@/components/studio/breakout-effect-preview";
import {
  Video,
  Eye,
  ThumbsUp,
  TrendingUp,
  Loader2,
} from "lucide-react";
import type { VideoTemplateName } from "@/types";

interface BreakoutVideo {
  id: string;
  template: string;
  templateId: VideoTemplateName;
  templateKey: string;
  views: number;
  engagement: number;
  trending: boolean;
  createdAt: string;
}

const TEMPLATE_KEY_MAP: Record<string, string> = {
  "360_hype": "template360Hype",
  "360° Hype": "template360Hype",
  "unboxing": "templateUnboxing",
  "Unboxing": "templateUnboxing",
  "quiet_luxury": "templateQuietLuxury",
  "Quiet Luxury": "templateQuietLuxury",
  "levitation": "templateLevitation",
  "Levitation": "templateLevitation",
  "transform": "templateTransform",
  "Transform": "templateTransform",
  "before_after": "templateBeforeAfter",
  "Before/After": "templateBeforeAfter",
  "asmr_closeup": "templateASMRCloseup",
  "ASMR Close-up": "templateASMRCloseup",
  "pov_unboxing": "templatePOVUnboxing",
  "POV Unboxing": "templatePOVUnboxing",
};

const TEMPLATE_ID_MAP: Record<string, VideoTemplateName> = {
  "360° Hype": "360_hype",
  "Unboxing": "unboxing",
  "Quiet Luxury": "quiet_luxury",
  "Levitation": "levitation",
  "Transform": "transform",
  "Before/After": "before_after",
  "ASMR Close-up": "asmr_closeup",
  "POV Unboxing": "pov_unboxing",
};

const DEMO_BREAKOUTS: BreakoutVideo[] = [
  {
    id: "demo-1",
    template: "360° Hype",
    templateId: "360_hype",
    templateKey: "template360Hype",
    views: 12400,
    engagement: 8.7,
    trending: true,
    createdAt: "2026-03-04T14:30:00Z",
  },
  {
    id: "demo-2",
    template: "Levitation",
    templateId: "levitation",
    templateKey: "templateLevitation",
    views: 8900,
    engagement: 6.2,
    trending: false,
    createdAt: "2026-03-02T10:15:00Z",
  },
  {
    id: "demo-3",
    template: "Quiet Luxury",
    templateId: "quiet_luxury",
    templateKey: "templateQuietLuxury",
    views: 5600,
    engagement: 9.1,
    trending: false,
    createdAt: "2026-02-28T16:45:00Z",
  },
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface BreakoutVideosSectionProps {
  productId: string;
  productName?: string;
}

export function BreakoutVideosSection({
  productId,
  productName,
}: BreakoutVideosSectionProps) {
  const t = useTranslations("productDetail");
  const tStudio = useTranslations("studio");
  const [breakouts, setBreakouts] = useState<BreakoutVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      // Fetch breakout videos
      try {
        const data = await getProductBreakouts(productId);
        if (cancelled) return;

        if (data.length > 0) {
          const mapped: BreakoutVideo[] = data
            .filter((b) => b.status === "ready")
            .map((b) => ({
              id: b.id,
              template: b.template,
              templateId: (TEMPLATE_ID_MAP[b.template] || b.template) as VideoTemplateName,
              templateKey: TEMPLATE_KEY_MAP[b.template] || "template360Hype",
              views: b.views ?? 0,
              engagement: b.engagement ?? 0,
              trending: b.trending ?? false,
              createdAt: b.createdAt,
            }));
          setBreakouts(mapped);
        } else {
          setBreakouts(DEMO_BREAKOUTS);
        }
      } catch {
        if (!cancelled) {
          setBreakouts(DEMO_BREAKOUTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
            <Video className="h-5 w-5" />
            {t("breakoutVideos")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (breakouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
            <Video className="h-5 w-5" />
            {t("breakoutVideos")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("noBreakouts")}
            </p>
            <Link href={`/studio/${productId}`}>
              <Button className="gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white">
                <Video className="h-4 w-4" />
                {t("generateVideo")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
          <Video className="h-5 w-5" />
          {t("breakoutVideos")}
        </CardTitle>
        <Link href={`/studio/${productId}`}>
          <Button
            size="sm"
            className="gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white"
          >
            <Video className="h-3.5 w-3.5" />
            {t("generateVideo")}
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {breakouts.map((video) => (
            <div
              key={video.id}
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              {/* Effect preview (CSS-only, no WebGL) */}
              <div className="relative aspect-video">
                <BreakoutEffectPreview
                  template={video.templateId}
                  productName={productName}
                />
                {/* Template badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                  <Badge className="bg-black/60 text-white border-0 text-xs">
                    {tStudio(video.templateKey)}
                  </Badge>
                  {video.trending && (
                    <Badge className="bg-orange-500 text-white border-0 text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {tStudio("trending")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="p-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(video.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {video.engagement}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
