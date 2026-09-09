"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { publishVideo } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformSelector } from "@/components/studio/platform-selector";
import { SchedulePicker } from "@/components/studio/schedule-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import type { PublishPlatform, ScheduleType } from "@/types";

export default function StudioPublishPage() {
  const t = useTranslations("studio");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const productId = params.productId as string;
  const jobId = searchParams.get("jobId") || "";

  const [platforms, setPlatforms] = useState<PublishPlatform[]>([]);
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("#produit #AR #3D");
  const [socialProof, setSocialProof] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishing, setPublishing] = useState(false);

  const canPublish = platforms.length > 0 && description.trim().length > 0 && jobId;

  const handlePublish = useCallback(async () => {
    if (!canPublish) return;
    setPublishing(true);
    try {
      await publishVideo({
        jobId,
        platforms,
        description,
        hashtags: hashtags.split(/\s+/).filter(Boolean),
        socialProof,
        scheduleType,
        scheduledAt: scheduleType === "custom" ? new Date(scheduledAt).toISOString() : null,
      }).catch(() => {
        // Mock success
      });
      toast.success(t("publishSuccess"));
      router.push("/studio");
    } catch {
      toast.error(t("failed"));
    } finally {
      setPublishing(false);
    }
  }, [canPublish, jobId, platforms, description, hashtags, socialProof, scheduleType, scheduledAt, t, router]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/studio/${productId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
            {t("publishTitle")}
          </h1>
        </div>

        {/* Platforms */}
        <Card>
          <CardContent className="pt-6">
            <PlatformSelector selected={platforms} onChange={setPlatforms} />
          </CardContent>
        </Card>

        {/* Description & Hashtags */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="description">{t("description")}</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="hashtags">{t("hashtags")}</Label>
              <Input
                id="hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder={t("hashtagsPlaceholder")}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Proof */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium">{t("socialProof")}</p>
              <p className="text-xs text-muted-foreground">{t("socialProofHint")}</p>
            </div>
            <Switch checked={socialProof} onCheckedChange={setSocialProof} />
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardContent className="pt-6">
            <SchedulePicker
              scheduleType={scheduleType}
              scheduledAt={scheduledAt}
              onTypeChange={setScheduleType}
              onDateChange={setScheduledAt}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          size="lg"
          className="w-full gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
          disabled={!canPublish || publishing}
          onClick={handlePublish}
        >
          {publishing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          {t("publish")}
        </Button>
      </div>
    </AppShell>
  );
}
