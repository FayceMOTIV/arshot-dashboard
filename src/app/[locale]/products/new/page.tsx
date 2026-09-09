"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import {
  createProduct,
  uploadCapture,
  getProductStatus,
  getJob,
  getArLink,
  type GenerationJob,
} from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import {
  Upload,
  ImageIcon,
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Scissors,
  Box,
  BadgeCheck,
  CloudUpload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { ARModel } from "@/types";
import { cn } from "@/lib/utils";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);

type Phase = "edit" | "generating" | "reveal" | "failed";

type StageKey = "stepUpload" | "stepCutout" | "stepModel" | "stepFinal";
const STAGE_ORDER: StageKey[] = ["stepUpload", "stepCutout", "stepModel", "stepFinal"];
const STAGE_ICONS = { stepUpload: CloudUpload, stepCutout: Scissors, stepModel: Box, stepFinal: BadgeCheck };

const MAX_PHOTOS = 4;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function suggestName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  if (!base || /^(img|image|photo|dsc|pxl|screenshot)/i.test(base)) return "";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** Resolve which pipeline stage we're on from real backend signals only. */
function resolveStage(product: ARModel | null, job: GenerationJob | null): StageKey {
  if (!product) return "stepUpload";
  if (product.status === "ready") return "stepFinal";
  const stage = (job?.stage || "").toLowerCase();
  if (stage.includes("final") || stage.includes("export") || stage.includes("optimis")) return "stepFinal";
  if (stage.includes("model") || stage.includes("3d") || stage.includes("mesh") || stage.includes("generat")) return "stepModel";
  if (stage.includes("cutout") || stage.includes("segment") || stage.includes("détour") || stage.includes("detour") || stage.includes("background")) return "stepCutout";
  if (product.status === "processing") return "stepCutout";
  return "stepUpload";
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function NewProductPage() {
  const t = useTranslations("productNew");
  const tc = useTranslations("common");
  const { user } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("edit");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [product, setProduct] = useState<ARModel | null>(null);
  const [stage, setStage] = useState<StageKey>("stepUpload");
  const [jobProgress, setJobProgress] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [failReason, setFailReason] = useState<"error" | "timeout">("error");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      timersRef.current.forEach(clearTimeout);
      photoUrls.forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elapsed timer during generation
  useEffect(() => {
    if (phase !== "generating") return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [phase, startedAt]);

  const addPhotos = useCallback(
    (files: File[]) => {
      const valid = files
        .filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
        .slice(0, MAX_PHOTOS);
      if (valid.length === 0) return;
      setPhotos(valid);
      setPhotoUrls((prev) => {
        prev.forEach(URL.revokeObjectURL);
        return valid.map((f) => URL.createObjectURL(f));
      });
      if (!nameTouched && valid[0]) {
        const suggestion = suggestName(valid[0].name);
        if (suggestion) setName(suggestion);
      }
    },
    [nameTouched]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addPhotos(Array.from(e.dataTransfer.files));
    },
    [addPhotos]
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /** Poll with exponential backoff (3s → ×1.35, cap 8s), hard timeout 5 min. */
  const pollUntilReady = useCallback(
    (productId: string, jobId: string | null, deadline: number) => {
      let interval = 3000;

      const tick = async () => {
        if (cancelledRef.current) return;
        if (Date.now() > deadline) {
          setFailReason("timeout");
          setPhase("failed");
          return;
        }
        try {
          const [status, job] = await Promise.all([
            getProductStatus(productId),
            jobId ? getJob(jobId).catch(() => null) : Promise.resolve(null),
          ]);
          if (cancelledRef.current) return;

          setStage(resolveStage(status, job));
          if (typeof job?.progress === "number") setJobProgress(job.progress);

          if (status.status === "ready") {
            setJobProgress(100);
            setProduct(status);
            timersRef.current.push(setTimeout(() => !cancelledRef.current && setPhase("reveal"), 600));
            return;
          }
          if (status.status === "failed" || job?.status === "failed") {
            setFailReason("error");
            setPhase("failed");
            return;
          }
        } catch {
          // Transient error — keep polling until deadline
        }
        interval = Math.min(interval * 1.35, 8000);
        timersRef.current.push(setTimeout(tick, interval));
      };

      timersRef.current.push(setTimeout(tick, interval));
    },
    []
  );

  const startGeneration = useCallback(async () => {
    if (!user || !name.trim() || photos.length === 0) return;

    setPhase("generating");
    setStage("stepUpload");
    setJobProgress(null);
    setStartedAt(Date.now());
    setElapsed(0);

    try {
      const created = await createProduct({ name: name.trim() });
      if (cancelledRef.current) return;
      setProduct(created);

      // Upload all photos the API accepts — at minimum the first one.
      let firstJobId: string | null = null;
      let uploaded = 0;
      for (let i = 0; i < photos.length; i++) {
        try {
          const res = await uploadCapture(created.id, photos[i]);
          uploaded += 1;
          if (i === 0) firstJobId = res?.jobId ?? null;
        } catch {
          if (i === 0) throw new Error("upload");
          // Extra photos are best-effort
        }
      }
      if (uploaded < photos.length) {
        toast.info(t("partialUpload", { count: uploaded }));
      }
      if (cancelledRef.current) return;

      setStage("stepCutout");
      pollUntilReady(created.id, firstJobId, Date.now() + POLL_TIMEOUT_MS);
    } catch (err) {
      if (cancelledRef.current) return;
      setFailReason("error");
      setPhase("failed");
      toast.error(err instanceof Error ? err.message : t("failed"));
    }
  }, [user, name, photos, pollUntilReady, t]);

  const reset = useCallback(() => {
    setPhase("edit");
    setPhotos([]);
    setPhotoUrls((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return [];
    });
    setName("");
    setNameTouched(false);
    setProduct(null);
    setJobProgress(null);
  }, []);

  const arLink = product ? getArLink(product.shortId || product.id) : "";

  const copyText = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      toast.success(t("resultCopied"));
    },
    [t]
  );

  const downloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !product) return;
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
      a.download = `arshot-qr-${product.shortId || "code"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [product]);

  const embedCode = `<iframe src="${arLink}" width="400" height="500" frameborder="0" allow="camera; xr-spatial-tracking"></iframe>`;

  const stageIndex = STAGE_ORDER.indexOf(stage);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8 pb-16">
        {/* ── EDIT ── */}
        {phase === "edit" && (
          <>
            <div className="anim-fade-up space-y-2 text-center">
              <h1 className="display-tight text-3xl font-bold sm:text-4xl">
                {t("title")} <span className="text-gradient">ARShot</span>
              </h1>
              <p className="text-muted-foreground">{t("studioTagline")}</p>
            </div>

            {/* Dropzone */}
            <div
              className={cn(
                "anim-fade-up glass rounded-2xl transition-all",
                dragOver && "glow-primary border-primary/60"
              )}
              style={{ animationDelay: "80ms" }}
            >
              {photos.length === 0 ? (
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-14 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-brand-gradient mb-5 flex h-16 w-16 items-center justify-center rounded-2xl glow-primary">
                    <Upload className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-lg font-semibold">{t("dragDrop")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("maxFileSize")} · {t("photosCount", { count: MAX_PHOTOS })}
                  </p>
                </div>
              ) : (
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {photoUrls.map((url, i) => (
                      <div
                        key={url}
                        className="anim-scale-in relative aspect-square overflow-hidden rounded-xl bg-muted"
                      >
                        <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        {i === 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                            {t("mainPhoto")}
                          </span>
                        )}
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/85"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <button
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">+</span>
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t("multiPhotoHint")}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => addPhotos(Array.from(e.target.files || []))}
              />
            </div>

            {/* Name */}
            <div
              className="anim-fade-up glass rounded-2xl p-5"
              style={{ animationDelay: "160ms" }}
            >
              <label className="mb-2 block text-sm font-medium">{t("nameQuestion")}</label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameTouched(true);
                }}
                placeholder={t("namePlaceholder")}
                className="h-12 border-input bg-background/50 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim() && photos.length > 0) startGeneration();
                }}
              />
            </div>

            {/* CTA */}
            <div className="anim-fade-up" style={{ animationDelay: "240ms" }}>
              <Button
                className="bg-brand-gradient hover:opacity-90 h-14 w-full gap-2 border-0 text-lg font-bold text-white glow-primary transition-opacity"
                disabled={photos.length === 0 || !name.trim()}
                onClick={startGeneration}
              >
                <Sparkles className="h-5 w-5" />
                {t("generate3d")}
              </Button>
            </div>
          </>
        )}

        {/* ── GENERATING — real pipeline stages ── */}
        {phase === "generating" && (
          <div className="anim-fade-in flex min-h-[60vh] flex-col items-center justify-center gap-10">
            <div className="relative">
              <div className="bg-brand-gradient anim-pulse-ring flex h-24 w-24 items-center justify-center rounded-3xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="glass w-full max-w-md rounded-2xl p-6">
              <div className="space-y-1">
                {STAGE_ORDER.map((key, i) => {
                  const Icon = STAGE_ICONS[key];
                  const done = i < stageIndex;
                  const active = i === stageIndex;
                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                        active && "bg-primary/10"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                          done
                            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-500"
                            : active
                              ? "border-primary/50 bg-primary/15 text-primary"
                              : "border-border text-muted-foreground/50"
                        )}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : active ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          done && "text-muted-foreground line-through opacity-60",
                          !done && !active && "text-muted-foreground/50"
                        )}
                      >
                        {t(key)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress — shown only when the backend reports a real percentage */}
              {jobProgress !== null && (
                <div className="mt-4 space-y-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="bg-brand-gradient h-full rounded-full transition-all duration-700"
                      style={{ width: `${jobProgress}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-muted-foreground">{jobProgress}%</p>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {t("elapsed", { time: formatElapsed(elapsed) })}
            </p>
          </div>
        )}

        {/* ── REVEAL ── */}
        {phase === "reveal" && product && (
          <div className="space-y-6">
            <div className="anim-fade-up space-y-2 text-center">
              <h1 className="display-tight text-3xl font-bold sm:text-4xl">
                {t("revealTitle")} <span className="text-gradient">✦</span>
              </h1>
              <p className="text-muted-foreground">{product.name}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-5">
              {/* 3D reveal */}
              <div className="glass anim-reveal relative aspect-square overflow-hidden rounded-2xl md:col-span-3">
                {product.glbUrl ? (
                  <ModelViewer
                    src={product.glbUrl}
                    alt={product.name}
                    iosSrc={product.usdzUrl ?? undefined}
                    autoRotate
                    cameraControls
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {t("processing")}
                  </div>
                )}
                {typeof product.qualityScore === "number" && (
                  <div className="absolute right-3 top-3 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold backdrop-blur">
                    AR Score {product.qualityScore}/100
                  </div>
                )}
              </div>

              {/* QR + link */}
              <div className="space-y-4 md:col-span-2">
                <div className="glass anim-fade-up rounded-2xl p-5" style={{ animationDelay: "150ms" }}>
                  <p className="mb-3 text-sm font-semibold">{t("resultQrCode")}</p>
                  <div className="flex flex-col items-center gap-3">
                    <div ref={qrRef} className="rounded-xl bg-white p-3">
                      <QRCodeSVG value={arLink} size={160} level="H" fgColor="#050508" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={downloadQR}>
                      <Download className="h-4 w-4" />
                      {t("downloadQr")}
                    </Button>
                  </div>
                </div>

                <div className="glass anim-fade-up space-y-3 rounded-2xl p-5" style={{ animationDelay: "250ms" }}>
                  <p className="text-sm font-semibold">{t("resultLink")}</p>
                  <div className="flex gap-2">
                    <Input value={arLink} readOnly className="bg-background/50 text-xs" />
                    <Button variant="outline" size="icon" onClick={() => copyText(arLink)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => copyText(embedCode)}
                  >
                    <Copy className="h-4 w-4" />
                    {t("resultEmbed")}
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full gap-2" asChild>
                    <a href={arLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {t("openArPage")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="anim-fade-up flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "350ms" }}>
              <Button
                className="bg-brand-gradient hover:opacity-90 h-12 flex-1 gap-2 border-0 text-white glow-primary"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                {t("resultViewProduct")}
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12 flex-1 gap-2" onClick={reset}>
                <Sparkles className="h-4 w-4" />
                {t("newProduct")}
              </Button>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {phase === "failed" && (
          <div className="anim-fade-in flex min-h-[50vh] items-center justify-center">
            <div className="glass flex max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-semibold">
                {failReason === "timeout" ? t("timeoutFailed") : t("failed")}
              </p>
              <p className="text-sm text-muted-foreground">{tc("error")}</p>
              <Button variant="outline" className="mt-2 gap-2" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                {t("retry")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
