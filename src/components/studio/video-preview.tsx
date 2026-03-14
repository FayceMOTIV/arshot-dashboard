"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Send, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface VideoPreviewProps {
  videoUrl: string;
  productId: string;
  jobId: string;
}

export function VideoPreview({ videoUrl, productId, jobId }: VideoPreviewProps) {
  const t = useTranslations("studio");

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `arshot-video-${jobId}.mp4`;
    a.click();
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="relative aspect-video max-h-[500px] overflow-hidden rounded-lg bg-black">
          <video
            src={videoUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            {t("downloadMp4")}
          </Button>
          <Link href={`/studio/${productId}/publish?jobId=${jobId}`} className="flex-1">
            <Button className="w-full gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
              <Send className="h-4 w-4" />
              {t("publishNow")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
