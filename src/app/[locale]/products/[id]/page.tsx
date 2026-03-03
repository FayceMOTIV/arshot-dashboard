"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getModel } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { ModelViewerElement } from "@/components/products/model-viewer-element";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Copy,
  Check,
  ScanLine,
  Smartphone,
  Globe,
  Loader2,
  Layers,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import type { ARModel } from "@/types";

const MOCK_MODEL: ARModel = {
  id: "1",
  userId: "u1",
  name: "Lampe scandinave",
  status: "ready",
  pipeline: "object_capture",
  shortId: "abc123",
  modelUrl: null,
  thumbnailUrl: null,
  usdzUrl: "https://example.com/model.usdz",
  glbUrl: "https://example.com/model.glb",
  qualityScore: 85,
  scanCount: 142,
  createdAt: "2025-02-15T10:00:00Z",
  updatedAt: "2025-02-15T12:00:00Z",
};

const MOCK_DEVICE_STATS = [
  { device: "iOS", count: 78, percentage: 55 },
  { device: "Android", count: 52, percentage: 37 },
  { device: "Desktop", count: 12, percentage: 8 },
];

const MOCK_COUNTRY_STATS = [
  { country: "France", countryCode: "FR", count: 89 },
  { country: "Allemagne", countryCode: "DE", count: 23 },
  { country: "Espagne", countryCode: "ES", count: 18 },
  { country: "États-Unis", countryCode: "US", count: 12 },
];

export default function ProductDetailPage() {
  const t = useTranslations("productDetail");
  const tProducts = useTranslations("products");
  const params = useParams();
  const { user } = useAuth();
  const [model, setModel] = useState<ARModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const modelId = params.id as string;
  const shareUrl = `https://ar.arshot.fr/p/${model?.shortId || ""}`;

  useEffect(() => {
    async function loadModel() {
      if (!user) return;
      try {
        const data = await getModel(modelId);
        setModel(data);
      } catch {
        setModel(MOCK_MODEL);
      } finally {
        setLoading(false);
      }
    }
    loadModel();
  }, [user, modelId]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(t("shareLink"));
    setTimeout(() => setCopied(false), 2000);
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
      toast.success("Code copié !");
    },
    [getEmbedCode]
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

  if (!model) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
            {model.name}
          </h1>
          <Badge
            className={
              model.status === "ready"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }
          >
            {tProducts(model.status)}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 3D Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-geist)]">
                {t("preview3d")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden">
                {model.glbUrl ? (
                  <ModelViewerElement
                    src={model.glbUrl}
                    alt={model.name}
                    autoRotate
                    cameraControls
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Aperçu 3D
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code + Share */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-geist)]">
                  {t("qrCode")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div ref={qrRef} className="rounded-lg bg-white p-4">
                  <QRCodeSVG
                    value={shareUrl}
                    size={200}
                    level="H"
                    fgColor="#0A0A0A"
                    imageSettings={{
                      src: "",
                      height: 0,
                      width: 0,
                      excavate: false,
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={downloadQR}
                >
                  <Download className="h-4 w-4" />
                  {t("downloadQR")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-geist)]">
                  {t("shareLink")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
                  <code className="flex-1 truncate text-sm">{shareUrl}</code>
                  <Button variant="ghost" size="sm" onClick={copyLink}>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-geist)]">
              {t("stats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ScanLine className="h-4 w-4" />
                  {t("totalScans")}
                </p>
                <p className="mt-1 text-3xl font-bold">{model.scanCount}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  {t("byDevice")}
                </p>
                <div className="mt-2 space-y-2">
                  {MOCK_DEVICE_STATS.map((d) => (
                    <div key={d.device} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {d.device === "Desktop" ? (
                          <Monitor className="h-3.5 w-3.5" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5" />
                        )}
                        {d.device}
                      </span>
                      <span className="font-medium">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {t("byCountry")}
                </p>
                <div className="mt-2 space-y-2">
                  {MOCK_COUNTRY_STATS.map((c) => (
                    <div key={c.countryCode} className="flex items-center justify-between text-sm">
                      <span>{c.country}</span>
                      <span className="font-medium">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
              <Layers className="h-5 w-5" />
              {t("embedCode")}
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
                      <Copy className="h-3.5 w-3.5" />
                      Copier
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
