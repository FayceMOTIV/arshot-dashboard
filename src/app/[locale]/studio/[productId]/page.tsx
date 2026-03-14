"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getProductStatus, getStudioTrends } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { TemplateGrid } from "@/components/studio/template-grid";
import { JobProgress } from "@/components/studio/job-progress";
import { VideoPreview } from "@/components/studio/video-preview";
import { ModelRecorder } from "@/components/studio/model-recorder";
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

  const handleGenerate = useCallback(() => {
    if (!selectedTemplate) return;

    if (!model?.glbUrl) {
      toast.error("Aucun modèle 3D disponible pour ce produit.");
      return;
    }

    // Génération côté client via MediaRecorder — 0€, pas d'API externe
    setCurrentJob({
      id: "client-local",
      productId,
      template: selectedTemplate,
      status: "processing",
      videoUrl: null,
      thumbnailUrl: null,
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
  }, [selectedTemplate, productId, model]);

  const handleReset = useCallback(() => {
    setCurrentJob(null);
    setSelectedTemplate(null);
  }, []);

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

  const isRecording =
    currentJob?.id === "client-local" && currentJob.status === "processing";

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

        {/* Template Selection — masqué pendant la génération */}
        {!currentJob && (
          <>
            <TemplateGrid
              selectedTemplate={selectedTemplate}
              trendingTemplate={trend?.recommendedTemplate || null}
              onSelect={setSelectedTemplate}
            />
            <div className="flex justify-center">
              <Button
                size="lg"
                className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white px-8"
                disabled={!selectedTemplate}
                onClick={handleGenerate}
              >
                <Wand2 className="h-5 w-5" />
                {t("generate")}
              </Button>
            </div>
          </>
        )}

        {/* Capture côté client — invisible, purement impératif */}
        {isRecording && model.glbUrl && (
          <ModelRecorder
            glbUrl={model.glbUrl}
            durationSeconds={8}
            onProgress={(p) =>
              setCurrentJob((prev) => (prev ? { ...prev, progress: p } : prev))
            }
            onDone={(url) => {
              setCurrentJob((prev) =>
                prev
                  ? { ...prev, status: "done", videoUrl: url, progress: 100, completedAt: new Date().toISOString() }
                  : prev
              );
              toast.success(t("videoReady"));
            }}
            onError={(err) => {
              setCurrentJob((prev) => (prev ? { ...prev, status: "failed" } : prev));
              toast.error(err);
            }}
          />
        )}

        {/* Progress bar pendant l'enregistrement */}
        {currentJob && currentJob.status !== "done" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-[family-name:var(--font-geist)]">
                {t("generating")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <JobProgress
                status={currentJob.status}
                progress={currentJob.progress}
              />
              {currentJob.status === "failed" && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Réessayer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vidéo prête */}
        {currentJob?.status === "done" && currentJob.videoUrl && (
          <>
            <VideoPreview
              videoUrl={currentJob.videoUrl}
              productId={productId}
              jobId={currentJob.id}
            />
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Générer une autre vidéo
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
