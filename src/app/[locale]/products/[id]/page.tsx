"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getProductStatus, exportAmazon, getArLink } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "@/i18n/navigation";
import {
  Download,
  Copy,
  Check,
  Loader2,
  Layers,
  QrCode,
  Star,
  Calendar,
  PackageOpen,
  ArrowLeft,
  Smartphone,
  AlertTriangle,
  FileBox,
} from "lucide-react";
import { toast } from "sonner";
import { StylePreviewSection } from "@/components/style-match/style-preview-section";
import { BreakoutVideosSection } from "@/components/products/breakout-videos-section";
import type { ARModel } from "@/types";
import { cn } from "@/lib/utils";

function getScoreTone(score: number | null): string {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-destructive";
}

function getStatusTone(status: string): string {
  switch (status) {
    case "ready":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-500";
    case "processing":
      return "border-amber-500/40 bg-amber-500/10 text-amber-500";
    case "failed":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
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
  const [amazonLoading, setAmazonLoading] = useState(false);
  const [amazonWarnings, setAmazonWarnings] = useState<string[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  const modelId = params.id as string;
  const shareUrl = model ? getArLink(model.shortId || model.id) : "";

  useEffect(() => {
    async function loadModel() {
      if (!user) return;
      try {
        const data = await getProductStatus(modelId);
        setModel(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("notFound"));
        setModel(null);
      } finally {
        setLoading(false);
      }
    }
    loadModel();
  }, [user, modelId, t]);

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
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const a = document.createElement("a");
      a.download = `arshot-qr-${model?.shortId || "code"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [model?.shortId]);

  const handleAmazonExport = useCallback(async () => {
    if (!model) return;
    setAmazonLoading(true);
    setAmazonWarnings([]);
    try {
      const result = await exportAmazon(model.id);
      setAmazonWarnings(result.warnings);
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        toast.success(t("amazonReady"));
      } else {
        toast.info(t("amazonNoFile"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("amazonFailed"));
    } finally {
      setAmazonLoading(false);
    }
  }, [model, t]);

  const getEmbedCode = useCallback(
    (platform: string) => {
      const viewerTag = `<model-viewer
  src="${model?.glbUrl || ""}"
  ios-src="${model?.usdzUrl || ""}"
  alt="${model?.name || ""}"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate
  style="width: 100%; height: 400px;">
</model-viewer>`;
      const script = `<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>`;
      switch (platform) {
        case "shopify":
          return `<!-- ARShot Viewer - Shopify -->\n${script}\n${viewerTag}`;
        case "wordpress":
          return `<!-- ARShot Viewer - WordPress -->\n${script}\n${viewerTag}`;
        case "html":
        default:
          return `<!DOCTYPE html>\n<html>\n<head>\n  ${script}\n</head>\n<body>\n  ${viewerTag}\n</body>\n</html>`;
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
        <div className="space-y-6">
          <div className="shimmer h-10 w-64 rounded-xl" />
          <div className="shimmer aspect-[16/9] rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  if (!model) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="glass flex max-w-md flex-col items-center gap-4 rounded-3xl p-10">
            <PackageOpen className="h-12 w-12 text-muted-foreground" />
            <h2 className="display-tight text-xl font-bold">{t("notFound")}</h2>
            <p className="text-muted-foreground">{t("notFoundDescription")}</p>
            <Link href="/products">
              <Button className="bg-brand-gradient hover:opacity-90 gap-2 border-0 text-white">
                <ArrowLeft className="h-4 w-4" />
                {tProducts("title")}
              </Button>
            </Link>
          </div>
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
        <div className="anim-fade-up flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="display-tight text-3xl font-bold">{model.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate(model.createdAt)}
              </span>
              <span className={cn("flex items-center gap-1.5 font-semibold", getScoreTone(model.qualityScore))}>
                <Star className="h-3.5 w-3.5" />
                {t("arScore")} {model.qualityScore ?? "—"}/100
              </span>
            </div>
          </div>
          <Badge variant="outline" className={cn("px-3 py-1", getStatusTone(model.status))}>
            {tProducts(model.status)}
          </Badge>
        </div>

        <Tabs defaultValue="preview" className="anim-fade-up" style={{ animationDelay: "100ms" }}>
          <TabsList className="glass">
            <TabsTrigger value="preview">{t("tabPreview")}</TabsTrigger>
            <TabsTrigger value="share">{t("tabShare")}</TabsTrigger>
            <TabsTrigger value="export">{t("tabExport")}</TabsTrigger>
          </TabsList>

          {/* ── Aperçu ── */}
          <TabsContent value="preview" className="space-y-6 pt-4">
            <div className="glass relative aspect-[16/9] overflow-hidden rounded-3xl">
              <div className="bg-aurora absolute inset-0" />
              {model.glbUrl ? (
                <ModelViewer
                  src={model.glbUrl}
                  alt={model.name}
                  iosSrc={model.usdzUrl ?? undefined}
                  autoRotate
                  cameraControls
                  ar
                />
              ) : (
                <div className="relative flex h-full items-center justify-center text-muted-foreground">
                  {t("preview3d")}
                </div>
              )}
            </div>

            <BreakoutVideosSection productId={modelId} productName={model.name} />
            <StylePreviewSection productId={modelId} />
          </TabsContent>

          {/* ── Partager ── */}
          <TabsContent value="share" className="space-y-6 pt-4">
            {model.glbUrl && (
              <div className="glass border-gradient relative overflow-hidden rounded-3xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <Smartphone className="h-4 w-4 text-primary" />
                      {t("customerViewTitle")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("customerViewDesc")}
                    </p>
                  </div>
                </div>
                <div className="relative h-72 sm:h-96">
                  <div className="bg-aurora absolute inset-0" />
                  <ModelViewer
                    src={model.glbUrl}
                    alt={model.name}
                    iosSrc={model.usdzUrl ?? undefined}
                    autoRotate
                    cameraControls
                    ar
                  />
                </div>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass flex flex-col items-center gap-4 rounded-2xl p-8">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <QrCode className="h-4 w-4" />
                  {t("qrCode")}
                </p>
                <div ref={qrRef} className="rounded-2xl bg-white p-4">
                  <QRCodeSVG value={shareUrl} size={180} level="H" fgColor="#050508" />
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={downloadQR}>
                  <Download className="h-4 w-4" />
                  {t("downloadQr")}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="glass space-y-3 rounded-2xl p-6">
                  <p className="text-sm font-semibold">{t("shareLink")}</p>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="bg-background/50 text-sm" />
                    <Button variant="outline" size="icon" onClick={copyArLink}>
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="bg-brand-gradient hover:opacity-90 w-full gap-2 border-0 text-white glow-primary">
                      <Smartphone className="h-4 w-4" />
                      {t("viewInAR")}
                    </Button>
                  </a>
                </div>
                <div className="glass flex items-center justify-between rounded-2xl p-6">
                  <span className="text-sm text-muted-foreground">{t("totalScans")}</span>
                  <span className="display-tight text-2xl font-bold">{model.scanCount}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Export ── */}
          <TabsContent value="export" className="space-y-6 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* GLB — honest raw download */}
              <div className="glass hover-lift space-y-3 rounded-2xl p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                  <FileBox className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold">{t("downloadGlb")}</p>
                <p className="text-sm text-muted-foreground">{t("downloadGlbDesc")}</p>
                {model.glbUrl ? (
                  <a href={model.glbUrl} download className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      .GLB
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {t("notReadyYet")}
                  </Button>
                )}
              </div>

              {/* Amazon — real backend export with spec warnings */}
              <div className="glass hover-lift space-y-3 rounded-2xl p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                  <PackageOpen className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold">{t("exportAmazonTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("exportAmazonDesc")}</p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={amazonLoading || model.status !== "ready"}
                  onClick={handleAmazonExport}
                >
                  {amazonLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {t("exportAmazonButton")}
                </Button>
                {amazonWarnings.length > 0 && (
                  <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t("amazonWarningsTitle")}
                    </p>
                    {amazonWarnings.map((w) => (
                      <p key={w} className="text-xs text-muted-foreground">• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Embed widget */}
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 flex items-center gap-2 font-semibold">
                <Layers className="h-5 w-5" />
                {t("widgetTitle")}
              </p>
              <Tabs defaultValue="shopify">
                <TabsList>
                  <TabsTrigger value="shopify">{t("shopify")}</TabsTrigger>
                  <TabsTrigger value="wordpress">{t("wordpress")}</TabsTrigger>
                  <TabsTrigger value="html">{t("html")}</TabsTrigger>
                </TabsList>
                {["shopify", "wordpress", "html"].map((platform) => (
                  <TabsContent key={platform} value={platform}>
                    <div className="relative">
                      <pre className="max-h-64 overflow-auto rounded-xl bg-background/60 p-4 text-xs">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
