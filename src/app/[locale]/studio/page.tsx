"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getProducts } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { VideoCounter } from "@/components/studio/video-counter";
import { CalendarWeek } from "@/components/studio/calendar-week";
import { ABTestCard } from "@/components/studio/ab-test-card";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Loader2, Clapperboard, Video, FlaskConical, Users, PackageOpen } from "lucide-react";
import type { ARModel, ScheduledPost, ABTest, PlanTier } from "@/types";

const MOCK_MODELS: ARModel[] = [
  {
    id: "1",
    userId: "u1",
    name: "Lampe scandinave",
    status: "ready",
    pipeline: "object_capture",
    shortId: "abc123",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: null,
    qualityScore: 85,
    scanCount: 142,
    createdAt: "2025-02-15T10:00:00Z",
    updatedAt: "2025-02-15T12:00:00Z",
  },
  {
    id: "2",
    userId: "u1",
    name: "Chaise design",
    status: "ready",
    pipeline: "flash_vdm",
    shortId: "def456",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: null,
    qualityScore: 72,
    scanCount: 89,
    createdAt: "2025-02-20T10:00:00Z",
    updatedAt: "2025-02-20T12:00:00Z",
  },
];

const MOCK_POSTS: ScheduledPost[] = [
  {
    id: "sp1",
    jobId: "j1",
    productName: "Lampe scandinave",
    platform: "tiktok",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    status: "scheduled",
  },
  {
    id: "sp2",
    jobId: "j2",
    productName: "Chaise design",
    platform: "instagram",
    scheduledAt: new Date(Date.now() + 172800000).toISOString(),
    status: "scheduled",
  },
];

const MOCK_AB_TEST: ABTest = {
  id: "ab1",
  productId: "1",
  variants: [
    { template: "quiet_luxury", views: 1200, engagement: 4.5, qrClicks: 34, winner: true },
    { template: "pov_unboxing", views: 890, engagement: 3.2, qrClicks: 21, winner: false },
    { template: "360_hype", views: 650, engagement: 2.1, qrClicks: 12, winner: false },
  ],
  status: "completed",
  startedAt: "2025-03-01T10:00:00Z",
  completedAt: "2025-03-02T10:00:00Z",
};

export default function StudioPage() {
  const t = useTranslations("studio");
  const { user } = useAuth();
  const [models, setModels] = useState<ARModel[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const readyModels = models.filter((m) => m.status === "ready");
  const userPlan: PlanTier = "pro";
  const videosUsed = 3;

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const modelsData = await getProducts().catch(() => MOCK_MODELS);
        setModels(modelsData);
        setPosts(MOCK_POSTS);
      } catch {
        setModels(MOCK_MODELS);
        setPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <VideoCounter plan={userPlan} videosUsed={videosUsed} />
            <Link href="/studio/ab-tests">
              <Button variant="outline" size="sm" className="gap-2">
                <FlaskConical className="h-4 w-4" />
                {t("abTests")}
              </Button>
            </Link>
            <Link href="/studio/customers-ar">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                {t("customersAr")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Calendar + A/B Test */}
        <div className="grid gap-4 md:grid-cols-2">
          <CalendarWeek posts={posts} />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-geist)]">
                <FlaskConical className="h-4 w-4" />
                {t("abTests")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ABTestCard test={MOCK_AB_TEST} mode="compact" />
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        ) : readyModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <PackageOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">{t("noProducts")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("noProductsHint")}
            </p>
            <Link href="/products/new" className="mt-4">
              <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                {t("createVideo")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {readyModels.map((model) => (
              <Card key={model.id} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <Clapperboard className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {model.scanCount} {t("abTestViews").toLowerCase()}
                    </p>
                    <Link href={`/studio/${model.id}`} className="mt-3 block">
                      <Button className="w-full gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white" size="sm">
                        <Video className="h-4 w-4" />
                        {t("createVideo")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
