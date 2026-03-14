"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";
import { getProductStatus, getStudioTrends, generateStudioVideo, getStudioJob } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { TemplateGrid } from "@/components/studio/template-grid";
import { JobProgress } from "@/components/studio/job-progress";
import { VideoPreview } from "@/components/studio/video-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, ArrowLeft, Flame } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import type { ARModel, VideoTemplateName, StudioJob, TrendData } from "@/types";

const MOCK_MODEL: ARModel = {
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
};

const MOCK_TREND: TrendData = {
  recommendedTemplate: "quiet_luxury",
  trendName: "Quiet Luxury",
  trendScore: 92,
};

export default function StudioProductPage() {
  const t = useTranslations("studio");
  const params = useParams();
  const { user } = useAuth();
  const productId = params.productId as string;

  const [model, setModel] = useState<ARModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplateName | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [currentJob, setCurrentJob] = useState<StudioJob | null>(null);
  const [generating, setGenerating] = useState(false);

  const { start: startPolling } = usePolling<StudioJob>({
    fetchFn: () => getStudioJob(currentJob?.id || ""),
    interval: 5000,
    maxPolls: 30,
    shouldStop: (job) => job.status === "done" || job.status === "failed",
    onUpdate: (job) => {
      setCurrentJob(job);
      if (job.status === "done") {
        toast.success(t("videoReady"));
      }
      if (job.status === "failed") {
        toast.error(t("videoFailed"));
      }
    },
    onMaxReached: () => {
      toast.error(t("videoFailed"));
      setCurrentJob((prev) =>
        prev ? { ...prev, status: "failed" } : null
      );
    },
    enabled: false,
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [modelData, trendData] = await Promise.all([
          getProductStatus(productId).catch(() => MOCK_MODEL),
          getStudioTrends().catch(() => MOCK_TREND),
        ]);
        setModel(modelData);
        setTrend(trendData);
      } catch {
        setModel(MOCK_MODEL);
        setTrend(MOCK_TREND);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, productId]);

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const job = await generateStudioVideo(productId, selectedTemplate).catch(
        () =>
          ({
            id: "mock-job-1",
            productId,
            template: selectedTemplate,
            status: "processing",
            videoUrl: null,
            thumbnailUrl: null,
            progress: 0,
            createdAt: new Date().toISOString(),
            completedAt: null,
          }) as StudioJob
      );
      setCurrentJob(job);
      startPolling();
    } catch {
      toast.error(t("videoFailed"));
    } finally {
      setGenerating(false);
    }
  }, [selectedTemplate, productId, startPolling, t]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
        </div>
      </AppShell>
    );
  }

  if (!model) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/studio">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
              {model.name}
            </h1>
            <p className="text-sm text-muted-foreground">{t("selectTemplate")}</p>
          </div>
          {trend && (
            <Badge className="ml-auto gap-1.5 bg-orange-100 text-orange-700">
              <Flame className="h-3.5 w-3.5" />
              {t("trendingThisWeek")}: {trend.trendName}
            </Badge>
          )}
        </div>

        {/* Template Selection */}
        <TemplateGrid
          selectedTemplate={selectedTemplate}
          trendingTemplate={trend?.recommendedTemplate || null}
          onSelect={setSelectedTemplate}
        />

        {/* Generate Button */}
        {!currentJob && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white px-8"
              disabled={!selectedTemplate || generating}
              onClick={handleGenerate}
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
              {generating ? t("generating") : t("generate")}
            </Button>
          </div>
        )}

        {/* Job Progress */}
        {currentJob && currentJob.status !== "done" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-[family-name:var(--font-geist)]">
                {t("generating")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobProgress
                status={currentJob.status}
                progress={currentJob.progress}
              />
            </CardContent>
          </Card>
        )}

        {/* Video Preview */}
        {currentJob?.status === "done" && currentJob.videoUrl && (
          <VideoPreview
            videoUrl={currentJob.videoUrl}
            productId={productId}
            jobId={currentJob.id}
          />
        )}
      </div>
    </AppShell>
  );
}
