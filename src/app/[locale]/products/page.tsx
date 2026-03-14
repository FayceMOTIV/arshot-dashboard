"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, createProduct, uploadCapture, getProductStatus } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { ProductCard } from "@/components/products/product-card";
import ModelViewerElement from "@/components/products/model-viewer-element";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Filter,
  ArrowUpDown,
  Loader2,
  PackageOpen,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import type { ARModel, ModelStatus } from "@/types";

type SortKey = "date" | "scans" | "name" | "quality";
type FilterKey = "all" | ModelStatus;
type ModalStep = "form" | "uploading" | "processing" | "ready" | "failed";

export default function ProductsPage() {
  const t = useTranslations("products");
  const tNew = useTranslations("productNew");
  const { user } = useAuth();
  const [models, setModels] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");

  // Modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("form");
  const [productName, setProductName] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<ARModel | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadModels() {
      if (!user) return;
      try {
        const data = await getProducts();
        setModels(data);
      } catch {
        setModels([]);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, [user]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...models];

    if (filter !== "all") {
      result = result.filter((m) => m.status === filter);
    }

    result.sort((a, b) => {
      switch (sort) {
        case "scans":
          return b.scanCount - a.scanCount;
        case "name":
          return a.name.localeCompare(b.name);
        case "quality":
          return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [models, filter, sort]);

  const filterOptions: FilterKey[] = ["all", "ready", "processing", "failed"];
  const sortOptions: SortKey[] = ["date", "scans", "name", "quality"];

  const resetModal = useCallback(() => {
    setModalStep("form");
    setProductName("");
    setVideoFile(null);
    setCreatedProduct(null);
    setUploadProgress(0);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleDialogChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) resetModal();
    },
    [resetModal]
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("video/")) {
      setVideoFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  }, []);

  const startPolling = useCallback(
    (productId: string) => {
      let pollCount = 0;
      const MAX_POLLS = 60; // 5 minutes at 5s intervals

      pollingRef.current = setInterval(async () => {
        pollCount++;

        if (pollCount >= MAX_POLLS) {
          setModalStep("failed");
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }

        try {
          const status = await getProductStatus(productId);
          setCreatedProduct(status);

          if (status.status === "processing" || status.status === "pending") {
            setUploadProgress((prev) => Math.min(prev + 3, 90));
          }

          if (status.status === "ready") {
            setModalStep("ready");
            setUploadProgress(100);
            if (pollingRef.current) clearInterval(pollingRef.current);
            const updatedModels = await getProducts();
            setModels(updatedModels);
          }

          if (status.status === "failed") {
            setModalStep("failed");
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch {
          // Continue polling on transient errors
        }
      }, 5000);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!productName.trim() || !videoFile) return;

    try {
      // Step 1: Create product
      setModalStep("uploading");
      setUploadProgress(10);
      const product = await createProduct({ name: productName.trim() });
      setCreatedProduct(product);
      setUploadProgress(30);

      // Step 2: Upload capture (may fail in dev if no storage configured)
      try {
        await uploadCapture(product.id, videoFile);
        setUploadProgress(50);
      } catch {
        // Capture upload failed (e.g. no R2 storage in dev)
        // Product was created successfully — continue to polling
        setUploadProgress(50);
      }

      // Step 3: Start polling
      setModalStep("processing");
      startPolling(product.id);
    } catch (err) {
      setModalStep("failed");
      toast.error(err instanceof Error ? err.message : tNew("failed"));
    }
  }, [productName, videoFile, startPolling, tNew]);

  const handleRetry = useCallback(() => {
    resetModal();
  }, [resetModal]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
            {t("title")}
          </h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {t("filter")}
                  {filter !== "all" && (
                    <Badge variant="secondary" className="ml-1">
                      {t(filter)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filterOptions.map((f) => (
                  <DropdownMenuItem key={f} onClick={() => setFilter(f)}>
                    {t(f === "all" ? "all" : f)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {t("sort")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)}>
                    {t(`sortBy${s.charAt(0).toUpperCase() + s.slice(1)}` as "sortByDate" | "sortByScans" | "sortByName" | "sortByQuality")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("addProduct")}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("noProducts")}</h3>
            <Button
              className="mt-4 gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("addProduct")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map((model) => (
              <ProductCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </div>

      {/* Modal Ajouter un produit */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-geist)]">
              {t("addProduct")}
            </DialogTitle>
            <DialogDescription>
              {tNew("subtitle")}
            </DialogDescription>
          </DialogHeader>

          {modalStep === "form" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">{t("productName")}</Label>
                <Input
                  id="productName"
                  placeholder={tNew("productNamePlaceholder")}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("uploadVideo")}</Label>
                <div
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    dragOver
                      ? "border-[#0066FF] bg-[#0066FF]/5"
                      : videoFile
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-border hover:border-[#0066FF]/50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {videoFile ? (
                    <div className="text-center">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setVideoFile(null)}
                      >
                        {t("changeVideo")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t("dragDropVideo")}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {tNew("orBrowse")}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("maxSize")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
                disabled={!productName.trim() || !videoFile}
                onClick={handleSubmit}
              >
                <Plus className="h-4 w-4" />
                {t("launchGeneration")}
              </Button>
            </div>
          )}

          {modalStep === "uploading" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#0066FF]" />
              <p className="font-medium">{tNew("uploading")}</p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {modalStep === "processing" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#0066FF]" />
              <p className="font-medium">{t("generationInProgress")}</p>
              <p className="text-sm text-muted-foreground">
                {tNew("processingSubtitle")}
              </p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {modalStep === "ready" && createdProduct && (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-medium">{t("generationReady")}</p>
              {createdProduct.glbUrl && (
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                  <ModelViewerElement
                    src={createdProduct.glbUrl}
                    alt={createdProduct.name}
                  />
                </div>
              )}
              <Link href={`/products/${createdProduct.id}`} className="w-full">
                <Button className="w-full gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                  <Eye className="h-4 w-4" />
                  {t("viewProduct")}
                </Button>
              </Link>
            </div>
          )}

          {modalStep === "failed" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <XCircle className="h-10 w-10 text-red-500" />
              <p className="font-medium">{t("generationFailed")}</p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleRetry}
              >
                <RotateCcw className="h-4 w-4" />
                {tNew("retry")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
