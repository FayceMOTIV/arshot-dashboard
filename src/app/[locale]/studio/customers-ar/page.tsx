"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, getCustomerARCaptures, generateSocialProofVideo, getStudioJob } from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerARCard } from "@/components/studio/customer-ar-card";
import { JobProgress } from "@/components/studio/job-progress";
import { VideoPreview } from "@/components/studio/video-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Users, Video, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ARModel, CustomerARCapture, StudioJob } from "@/types";

const MOCK_CAPTURES: CustomerARCapture[] = [
  { id: "c1", productId: "1", imageUrl: "", capturedAt: "2025-03-01T14:00:00Z", device: "ios", country: "France" },
  { id: "c2", productId: "1", imageUrl: "", capturedAt: "2025-03-01T15:30:00Z", device: "android", country: "Allemagne" },
  { id: "c3", productId: "1", imageUrl: "", capturedAt: "2025-03-02T09:00:00Z", device: "ios", country: "Espagne" },
  { id: "c4", productId: "1", imageUrl: "", capturedAt: "2025-03-02T11:00:00Z", device: "desktop", country: "France" },
  { id: "c5", productId: "2", imageUrl: "", capturedAt: "2025-03-02T16:00:00Z", device: "ios", country: "France" },
  { id: "c6", productId: "2", imageUrl: "", capturedAt: "2025-03-03T08:00:00Z", device: "android", country: "Italie" },
];

const MOCK_MODELS: ARModel[] = [
  {
    id: "1", userId: "u1", name: "Lampe scandinave", status: "ready", pipeline: "object_capture",
    shortId: "abc123", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null,
    qualityScore: 85, scanCount: 142, createdAt: "2025-02-15T10:00:00Z", updatedAt: "2025-02-15T12:00:00Z",
  },
  {
    id: "2", userId: "u1", name: "Chaise design", status: "ready", pipeline: "flash_vdm",
    shortId: "def456", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null,
    qualityScore: 72, scanCount: 89, createdAt: "2025-02-20T10:00:00Z", updatedAt: "2025-02-20T12:00:00Z",
  },
];

export default function CustomersARPage() {
  const t = useTranslations("studio");
  const { user } = useAuth();
  const [models, setModels] = useState<ARModel[]>([]);
  const [captures, setCaptures] = useState<CustomerARCapture[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<StudioJob | null>(null);

  const { start: startPolling } = usePolling<StudioJob>({
    fetchFn: () => getStudioJob(currentJob?.id || ""),
    interval: 5000,
    maxPolls: 30,
    shouldStop: (job) => job.status === "done" || job.status === "failed",
    onUpdate: (job) => {
      setCurrentJob(job);
      if (job.status === "done") toast.success(t("videoReady"));
      if (job.status === "failed") toast.error(t("videoFailed"));
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
        const modelsData = await getProducts().catch(() => MOCK_MODELS);
        setModels(modelsData.filter((m) => m.status === "ready"));

        // Load captures for first product or all
        const allCaptures: CustomerARCapture[] = [];
        for (const model of modelsData.filter((m) => m.status === "ready")) {
          const modelCaptures = await getCustomerARCaptures(model.id).catch(() =>
            MOCK_CAPTURES.filter((c) => c.productId === model.id)
          );
          allCaptures.push(...modelCaptures);
        }
        setCaptures(allCaptures);
      } catch {
        setModels(MOCK_MODELS);
        setCaptures(MOCK_CAPTURES);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredCaptures =
    selectedProduct === "all"
      ? captures
      : captures.filter((c) => c.productId === selectedProduct);

  const handleGenerateSocialProof = useCallback(async () => {
    const productId = selectedProduct === "all" ? models[0]?.id : selectedProduct;
    if (!productId) return;
    setGenerating(true);
    try {
      const job = await generateSocialProofVideo(productId).catch(
        () =>
          ({
            id: "mock-sp-job",
            productId,
            template: "pov_unboxing" as const,
            status: "processing" as const,
            videoUrl: null,
            thumbnailUrl: null,
            progress: 0,
            createdAt: new Date().toISOString(),
            completedAt: null,
          }) satisfies StudioJob
      );
      setCurrentJob(job);
      startPolling();
    } catch {
      toast.error(t("videoFailed"));
    } finally {
      setGenerating(false);
    }
  }, [selectedProduct, models, startPolling, t]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/studio">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
                {t("customersArTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("customersArSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
              disabled={generating || filteredCaptures.length === 0}
              onClick={handleGenerateSocialProof}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              {t("generateSocialProof")}
            </Button>
          </div>
        </div>

        {/* Social Proof hint */}
        {filteredCaptures.length > 0 && (
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <Users className="h-5 w-5 text-[#0066FF]" />
              <p className="text-sm">
                {t("socialProofVideoHint", { count: filteredCaptures.length })}
              </p>
            </CardContent>
          </Card>
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
              <JobProgress status={currentJob.status} progress={currentJob.progress} />
            </CardContent>
          </Card>
        )}

        {/* Video Preview */}
        {currentJob?.status === "done" && currentJob.videoUrl && (
          <VideoPreview
            videoUrl={currentJob.videoUrl}
            productId={selectedProduct === "all" ? models[0]?.id || "" : selectedProduct}
            jobId={currentJob.id}
          />
        )}

        {/* Captures Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        ) : filteredCaptures.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">{t("noCaptures")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("noCapturesHint")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCaptures.map((capture) => (
              <CustomerARCard key={capture.id} capture={capture} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
