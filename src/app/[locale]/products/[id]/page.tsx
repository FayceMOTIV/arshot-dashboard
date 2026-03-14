"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getProductStatus } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "@/i18n/navigation";
import {
  Download,
  Copy,
  Check,
  Loader2,
  Layers,
  ExternalLink,
  QrCode,
  Star,
  Calendar,
  ShoppingBag,
  PackageOpen,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { StylePreviewSection } from "@/components/style-match/style-preview-section";
import { BreakoutVideosSection } from "@/components/products/breakout-videos-section";
import type { ARModel } from "@/types";

function getScoreBadgeColor(score: number | null): string {
  if (!score) return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  if (score >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  if (score >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "ready":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
    case "processing":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

export default function ProductDetailPage() {
  const t = useTranslations("productDetail");
  const tProducts = useTranslations("products");
  const params = useParams();
  const { user } = useAuth();
  const [model, setModel] = useState<ARModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const modelId = params.id as string;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ar.arshot.fr";
  const shareUrl = `${appUrl}/ar/${model?.shortId || model?.id || ""}`;

  useEffect(() => {
    async function loadModel() {
      if (!user) return;
      try {
        const data = await getProductStatus(modelId);
        setModel(data);
      } catch {
        setModel(null);
      } finally {
        setLoading(false);
      }
    }
    loadModel();
  }, [user, modelId]);

  const copyArLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success(t("arLinkCopied"));
    setTimeout(() => setCopiedLink(false), 2000);
  }, [shareUrl, t]);

  const downloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `arshot-qr-${model?.shortId || "code"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [model?.shortId]);

  const getEmbedCode = useCallback(
    (platform: string) => {
      switch (platform) {
        case "shopify":
          return `<!-- ARShot Viewer - Shopify -->
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
<model-viewer
  src="${model?.glbUrl || ""}"
  ios-src="${model?.usdzUrl || ""}"
  alt="${model?.name || ""}"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate
  style="width: 100%; height: 400px;">
</model-viewer>`;
        case "wordpress":
          return `<!-- ARShot Viewer - WordPress -->
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
<model-viewer
  src="${model?.glbUrl || ""}"
  ios-src="${model?.usdzUrl || ""}"
  alt="${model?.name || ""}"
  ar
  camera-controls
  auto-rotate
  style="width: 100%; height: 400px;">
</model-viewer>`;
        case "html":
        default:
          return `<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
</head>
<body>
  <model-viewer
    src="${model?.glbUrl || ""}"
    ios-src="${model?.usdzUrl || ""}"
    alt="${model?.name || ""}"
    ar
    ar-modes="webxr scene-viewer quick-look"
    camera-controls
    auto-rotate
    style="width: 100%; height: 500px;">
  </model-viewer>
</body>
</html>`;
      }
    },
    [model]
  );

  const copyEmbed = useCallback(
    async (platform: string) => {
      await navigator.clipboard.writeText(getEmbedCode(platform));
      setCopiedEmbed(platform);
      toast.success(t("widgetCopied"));
      setTimeout(() => setCopiedEmbed(null), 2000);
    },
    [getEmbedCode, t]
  );

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
        </div>
      </AppShell>
    );
  }

  if (!model) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">{t("notFound")}</h2>
          <p className="text-muted-foreground mb-6">{t("notFoundDescription")}</p>
          <Link href="/products">
            <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
              <ArrowLeft className="h-4 w-4" />
              {tProducts("title")}
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const formattedDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
            {model.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusBadgeColor(model.status)}>
              {tProducts(model.status)}
            </Badge>
          </div>
        </div>

        {/* Layout 2 colonnes */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Gauche (60%) — Viewer 3D */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                {model.glbUrl ? (
                  <ModelViewer
                    src={model.glbUrl}
                    alt={model.name}
                    iosSrc={model.usdzUrl ?? undefined}
                    autoRotate
                    cameraControls
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {t("preview3d")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Droite (40%) — Infos */}
          <div className="space-y-4 lg:col-span-2">
            {/* AR Score */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Star className="h-4 w-4 text-[#0066FF]" />
                    {t("arScore")}
                  </span>
                  <Badge className={getScoreBadgeColor(model.qualityScore)}>
                    {model.qualityScore ?? "—"}/100
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("createdAt")}
                  </span>
                  <span>{formattedDate(model.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("updatedAt")}
                  </span>
                  <span>{formattedDate(model.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Exports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium font-[family-name:var(--font-geist)]">
                  {t("exports")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="w-full justify-start gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
                  >
                    <Smartphone className="h-4 w-4" />
                    {t("viewInAR")}
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={copyArLink}
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {t("copyArLink")}
                </Button>
                {model.glbUrl && (
                  <>
                    <a href={model.glbUrl} download className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {t("exportShopify")}
                      </Button>
                    </a>
                    <a href={model.glbUrl} download className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("exportAmazon")}
                      </Button>
                    </a>
                  </>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium font-[family-name:var(--font-geist)]">
                  <QrCode className="h-4 w-4" />
                  {t("qrCode")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                <div ref={qrRef} className="rounded-lg bg-white p-3">
                  <QRCodeSVG
                    value={shareUrl}
                    size={160}
                    level="H"
                    fgColor="#0A0A0A"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={downloadQR}
                >
                  <Download className="h-4 w-4" />
                  {t("downloadQr")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Breakout Videos */}
        <BreakoutVideosSection
          productId={modelId}
          productName={model.name}
        />

        {/* Style Match Preview */}
        <StylePreviewSection productId={modelId} />

        {/* Widget Embed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
              <Layers className="h-5 w-5" />
              {t("widgetTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="shopify">
              <TabsList>
                <TabsTrigger value="shopify">{t("shopify")}</TabsTrigger>
                <TabsTrigger value="wordpress">{t("wordpress")}</TabsTrigger>
                <TabsTrigger value="html">{t("html")}</TabsTrigger>
              </TabsList>
              {["shopify", "wordpress", "html"].map((platform) => (
                <TabsContent key={platform} value={platform}>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                      <code>{getEmbedCode(platform)}</code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-2 gap-1.5"
                      onClick={() => copyEmbed(platform)}
                    >
                      {copiedEmbed === platform ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {t("widgetCopy")}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
