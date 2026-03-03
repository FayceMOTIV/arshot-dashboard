"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { generateModel, getModel } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Video,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { PipelineType, ModelStatus } from "@/types";

type UploadMode = "video" | "photos";
type PageStep = "upload" | "uploading" | "processing" | "ready" | "failed";

function detectPipeline(files: File[]): PipelineType {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIPhone = /iPhone/i.test(userAgent);
  if (isIPhone && files.some((f) => f.type.startsWith("video/"))) {
    return "object_capture";
  }
  return "flash_vdm";
}

export default function NewProductPage() {
  const t = useTranslations("productNew");
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<PageStep>("upload");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<UploadMode>("video");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pipeline, setPipeline] = useState<PipelineType>("flash_vdm");
  const [modelId, setModelId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (files.length > 0) {
      setPipeline(detectPipeline(files));
    }
  }, [files]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (mode === "video") {
        const videoFile = droppedFiles.find((f) => f.type.startsWith("video/"));
        if (videoFile) setFiles([videoFile]);
      } else {
        const imageFiles = droppedFiles.filter((f) => f.type.startsWith("image/"));
        setFiles(imageFiles.slice(0, 4));
      }
    },
    [mode]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (mode === "video") {
        setFiles(selectedFiles.slice(0, 1));
      } else {
        setFiles(selectedFiles.slice(0, 4));
      }
    },
    [mode]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const model = await getModel(id);
          if (model.status === "ready") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStep("ready");
            toast.success(t("ready"));
          } else if (model.status === "failed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStep("failed");
            toast.error(t("failed"));
          }
        } catch {
          // Continue polling on network errors
        }
      }, 5000);
    },
    [t]
  );

  const handleSubmit = useCallback(async () => {
    if (!user || !name.trim() || files.length === 0) return;

    setStep("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("pipeline", pipeline);
    formData.append("userId", user.uid);
    files.forEach((file) => formData.append("files", file));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const result = await generateModel(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setModelId(result.id);
      setStep("processing");
      startPolling(result.id);
    } catch (err) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : "Erreur upload";
      toast.error(message);
      setStep("upload");
    }
  }, [user, name, files, pipeline, startPolling]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>

        {step === "upload" && (
          <>
            {/* Product name */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">{t("productName")}</Label>
                  <Input
                    id="productName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("productNamePlaceholder")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upload mode toggle */}
            <div className="flex gap-3">
              <Button
                variant={mode === "video" ? "default" : "outline"}
                className={mode === "video" ? "gap-2 bg-[#0066FF] text-white" : "gap-2"}
                onClick={() => {
                  setMode("video");
                  setFiles([]);
                }}
              >
                <Video className="h-4 w-4" />
                {t("uploadVideo")}
              </Button>
              <Button
                variant={mode === "photos" ? "default" : "outline"}
                className={mode === "photos" ? "gap-2 bg-[#0066FF] text-white" : "gap-2"}
                onClick={() => {
                  setMode("photos");
                  setFiles([]);
                }}
              >
                <ImageIcon className="h-4 w-4" />
                {t("uploadPhotos")}
              </Button>
            </div>

            {/* Drop zone */}
            <Card>
              <CardContent className="pt-6">
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 transition-colors hover:border-[#0066FF]/50 hover:bg-[#0066FF]/5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium">{t("dragDrop")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("orBrowse")}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {mode === "video" ? t("uploadVideo") : t("uploadPhotos")}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={mode === "video" ? "video/*" : "image/*"}
                    multiple={mode === "photos"}
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Selected files */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {mode === "video" ? (
                            <Video className="h-4 w-4 text-[#0066FF]" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-[#0066FF]" />
                          )}
                          <span className="text-sm truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline detection */}
            {files.length > 0 && (
              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  {pipeline === "object_capture" ? (
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Zap className="h-5 w-5 text-[#0066FF]" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{t("pipeline")}</p>
                    <p className="text-sm text-muted-foreground">
                      {pipeline === "object_capture"
                        ? t("objectCapture")
                        : t("flashVdm")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <Button
              className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white text-base gap-2"
              disabled={!name.trim() || files.length === 0}
              onClick={handleSubmit}
            >
              <Sparkles className="h-5 w-5" />
              {t("generate")}
            </Button>
          </>
        )}

        {step === "uploading" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-[#0066FF]" />
              <p className="font-medium">{t("uploading")}</p>
              <Progress value={uploadProgress} className="w-64 [&>div]:bg-[#0066FF]" />
              <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
            </CardContent>
          </Card>
        )}

        {step === "processing" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#0066FF]/20 border-t-[#0066FF]" />
              </div>
              <p className="text-lg font-medium">{t("processing")}</p>
              <p className="text-sm text-muted-foreground">
                {t("processingSubtitle")}
              </p>
              <Badge variant="secondary">Pipeline: {pipeline === "object_capture" ? "Object Capture" : "FlashVDM"}</Badge>
            </CardContent>
          </Card>
        )}

        {step === "ready" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
              <p className="text-lg font-medium">{t("ready")}</p>
              <Button
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white gap-2"
                onClick={() => router.push(`/products/${modelId}`)}
              >
                Voir le produit
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "failed" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-lg font-medium">{t("failed")}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setFiles([]);
                  setUploadProgress(0);
                }}
              >
                {t("retry")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
