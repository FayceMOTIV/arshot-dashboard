"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { createProduct, uploadCapture, getProductStatus, IS_MOCK } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Eye,
  Smartphone,
  Film,
  Copy,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { ARModel } from "@/types";

type WizardStep = "photos" | "name" | "experience" | "generating" | "result" | "failed";
type ExperienceType = "3d" | "ar" | "breakout";

const PROGRESS_MESSAGES: { key: string; percent: number }[] = [
  { key: "progressAnalyzing", percent: 5 },
  { key: "progressBackground", percent: 25 },
  { key: "progressGenerating", percent: 50 },
  { key: "progressOptimizing", percent: 75 },
  { key: "progressQrCode", percent: 92 },
  { key: "progressDone", percent: 100 },
];

const DEMO_GLB = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

function makeMockProduct(name: string): ARModel {
  const id = `mock-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    name,
    status: "ready",
    shortId: id.slice(5, 11),
    modelUrl: DEMO_GLB,
    glbUrl: DEMO_GLB,
    usdzUrl: null,
    thumbnailUrl: null,
    qualityScore: 84,
    arScore: 84,
    scanCount: 0,
    pipeline: "object_capture",
    userId: "dev-user-001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as ARModel;
}

const EXPERIENCE_OPTIONS: { id: ExperienceType; icon: React.ElementType; titleKey: string; descKey: string }[] = [
  { id: "3d", icon: Eye, titleKey: "exp3dTitle", descKey: "exp3dDesc" },
  { id: "ar", icon: Smartphone, titleKey: "expArTitle", descKey: "expArDesc" },
  { id: "breakout", icon: Film, titleKey: "expBreakoutTitle", descKey: "expBreakoutDesc" },
];

export default function NewProductPage() {
  const t = useTranslations("productNew");
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>("photos");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [selectedExp, setSelectedExp] = useState<ExperienceType | null>(null);
  const [product, setProduct] = useState<ARModel | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 10;

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      photoUrls.forEach(URL.revokeObjectURL);
    };
  }, [photoUrls]);

  useEffect(() => {
    if (step === "name") setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [step]);

  const addPhotos = useCallback((files: File[]) => {
    const valid = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 20 * 1024 * 1024)
      .slice(0, MAX_PHOTOS - photos.length);
    if (valid.length === 0) return;
    setPhotos((prev) => [...prev, ...valid]);
    setPhotoUrls((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  }, [photos.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addPhotos(Array.from(e.dataTransfer.files));
  }, [addPhotos]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addPhotos(Array.from(e.target.files));
    e.target.value = "";
  }, [addPhotos]);

  const removePhoto = useCallback((index: number) => {
    setPhotoUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const loadDemoPhotos = useCallback(async () => {
    const demoUrls = [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
    ];
    const demoFiles: File[] = [];
    for (const url of demoUrls) {
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        demoFiles.push(new File([blob], `demo-${demoFiles.length + 1}.jpg`, { type: "image/jpeg" }));
      } catch { /* skip */ }
    }
    if (demoFiles.length > 0) addPhotos(demoFiles);
    else toast.error("Impossible de charger les photos démo");
  }, [addPhotos]);

  const runMockGeneration = useCallback((productName: string) => {
    setStep("generating");
    setProgressIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i < PROGRESS_MESSAGES.length) {
        setProgressIndex(i);
      } else {
        clearInterval(interval);
        setProduct(makeMockProduct(productName));
        setTimeout(() => setStep("result"), 400);
      }
    }, 1800);
  }, []);

  const startGeneration = useCallback(async () => {
    if (!name.trim() || photos.length === 0 || !selectedExp) return;

    // Mock mode: skip API, simulate directly
    if (IS_MOCK) {
      runMockGeneration(name.trim());
      return;
    }

    if (!user) return;
    setStep("generating");
    setProgressIndex(0);
    setErrorMsg(null);

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex += 1;
      if (msgIndex < PROGRESS_MESSAGES.length - 1) setProgressIndex(msgIndex);
      else clearInterval(msgInterval);
    }, 3000);

    try {
      const created = await createProduct({ name: name.trim() });
      await uploadCapture(created.id, photos[0]);

      pollingRef.current = setInterval(async () => {
        try {
          const status = await getProductStatus(created.id);
          if (status.status === "ready") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            clearInterval(msgInterval);
            setProgressIndex(PROGRESS_MESSAGES.length - 1);
            setProduct(status);
            setTimeout(() => setStep("result"), 800);
          } else if (status.status === "failed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            clearInterval(msgInterval);
            setErrorMsg(t("failed"));
            setStep("failed");
          }
        } catch { /* continue polling */ }
      }, 4000);
    } catch (err) {
      clearInterval(msgInterval);
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      setErrorMsg(msg);
      toast.error(msg);
      setStep("failed");
    }
  }, [user, name, photos, selectedExp, t, runMockGeneration]);

  const arBaseUrl = typeof window !== "undefined" ? window.location.origin : "https://ar.arshot.io";
  const arLink = product ? `${arBaseUrl}/ar/${product.shortId}` : "";

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(arLink);
    setLinkCopied(true);
    toast.success(t("resultCopied"));
    setTimeout(() => setLinkCopied(false), 2000);
  }, [arLink, t]);

  const currentStep = step === "photos" ? 1 : step === "name" ? 2 : step === "experience" ? 3 : 0;
  const steps = [t("stepPhotos"), t("stepName"), t("stepExperience")];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 pb-10">

        {/* Stepper */}
        {["photos", "name", "experience"].includes(step) && (
          <div className="flex items-center justify-center gap-2">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${i + 1 <= currentStep ? "bg-[#0066FF] text-white" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`text-sm font-medium ${i + 1 <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`h-px w-8 ${i + 1 < currentStep ? "bg-[#0066FF]" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: Photos ── */}
        {step === "photos" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground mt-1">
                Ajoutez jusqu&apos;à {MAX_PHOTOS} photos · Plus de photos = meilleur résultat
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                {photos.length === 0 ? (
                  // Empty state — full drop zone
                  <div
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-14 transition-colors hover:border-[#0066FF]/60 hover:bg-[#0066FF]/5 cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-semibold text-lg">{t("dragDrop")}</p>
                    <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WEBP · Max 20 MB</p>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                  </div>
                ) : (
                  // Photos grid
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {photoUrls.map((url, i) => (
                        <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                          <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-[#0066FF] text-white px-1.5 py-0.5 rounded-md">
                              Principale
                            </span>
                          )}
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add more slot */}
                      {photos.length < MAX_PHOTOS && (
                        <div
                          className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-[#0066FF]/60 hover:bg-[#0066FF]/5 transition-colors"
                          onClick={() => addMoreInputRef.current?.click()}
                        >
                          <Plus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground mt-1">{photos.length}/{MAX_PHOTOS}</span>
                          <input ref={addMoreInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                        </div>
                      )}
                    </div>

                    {/* Tip */}
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                        <ImageIcon className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                          <strong>Conseil :</strong> photographiez le produit sous plusieurs angles (face, dos, côtés, dessus, détails). {MAX_PHOTOS - photos.length > 0 ? `Vous pouvez encore ajouter ${MAX_PHOTOS - photos.length} photo${MAX_PHOTOS - photos.length > 1 ? "s" : ""}.` : "Vous avez atteint le maximum."}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={loadDemoPhotos}>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("useDemoPhotos")}
            </Button>

            <Button
              className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white text-base"
              disabled={photos.length === 0}
              onClick={() => setStep("name")}
            >
              Suivant — Nommer le produit
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </>
        )}

        {/* ── STEP 2: Name ── */}
        {step === "name" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("nameQuestion")}</h1>
              <p className="text-muted-foreground mt-1">Ce nom apparaîtra sur la page AR partagée</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="text-lg h-14 text-center"
                  onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep("experience"); }}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep("photos")}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t("stepPhotos")}
              </Button>
              <Button
                className="flex-1 h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white text-base"
                disabled={!name.trim()}
                onClick={() => setStep("experience")}
              >
                Suivant — Choisir l&apos;expérience
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 3: Experience ── */}
        {step === "experience" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("chooseExperience")}</h1>
              <p className="text-muted-foreground mt-1">Sélectionnez le type d&apos;expérience à générer</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {EXPERIENCE_OPTIONS.map(({ id, icon: Icon, titleKey, descKey }) => {
                const isSelected = selectedExp === id;
                return (
                  <Card
                    key={id}
                    onClick={() => setSelectedExp(id)}
                    className={`cursor-pointer transition-all select-none ${
                      isSelected
                        ? "border-[#0066FF] ring-2 ring-[#0066FF]/30 shadow-md bg-[#0066FF]/5"
                        : "hover:border-[#0066FF]/40 hover:shadow-sm"
                    }`}
                  >
                    <CardContent className="flex flex-col items-center text-center pt-6 pb-5 gap-3">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-[#0066FF]" : "bg-[#0066FF]/10"}`}>
                        <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-[#0066FF]"}`} />
                      </div>
                      <p className={`font-semibold text-sm ${isSelected ? "text-[#0066FF]" : ""}`}>
                        {t(titleKey as Parameters<typeof t>[0])}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {t(descKey as Parameters<typeof t>[0])}
                      </p>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-[#0066FF]" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {!selectedExp && (
              <p className="text-center text-sm text-muted-foreground">
                Cliquez sur une option pour la sélectionner
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep("name")}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t("stepName")}
              </Button>
              <Button
                className="flex-1 h-14 bg-[#0066FF] hover:bg-[#0052CC] text-white text-base font-bold gap-2 disabled:opacity-50"
                disabled={!selectedExp}
                onClick={startGeneration}
              >
                <Sparkles className="h-5 w-5" />
                {t("generateWithAI")}
              </Button>
            </div>
          </>
        )}

        {/* ── GENERATING ── */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-[#0066FF] flex items-center justify-center animate-pulse">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 h-24 w-24 rounded-2xl bg-[#0066FF]/30 animate-ping" />
            </div>

            <div className="w-full max-w-xs space-y-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-[#0066FF] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${PROGRESS_MESSAGES[progressIndex]?.percent ?? 0}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {t(PROGRESS_MESSAGES[progressIndex]?.key as Parameters<typeof t>[0] ?? "progressAnalyzing")}
              </p>
              <p className="text-center text-xs text-muted-foreground/60">
                {photos.length} photo{photos.length > 1 ? "s" : ""} · {name}
              </p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && product && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
              <h1 className="text-2xl font-bold">{t("progressDone")}</h1>
              <p className="text-muted-foreground">{product.name}</p>
            </div>

            {/* AR Score + scans */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-3xl font-extrabold text-[#0066FF]">{product.qualityScore ?? 84}/100</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("resultArScore")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <p className="text-3xl font-extrabold">0</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("resultScans")}</p>
                </CardContent>
              </Card>
            </div>

            {/* QR Code */}
            <Card>
              <CardContent className="flex flex-col items-center pt-6 gap-4">
                <p className="font-semibold">{t("resultQrCode")}</p>
                <div className="bg-white p-4 rounded-xl border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(arLink)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(arLink)}`}
                    download={`arshot-${product.shortId}.png`}
                  >
                    Télécharger PNG
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* AR Link */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="font-semibold">{t("resultLink")}</p>
                <div className="flex gap-2">
                  <Input value={arLink} readOnly className="text-sm font-mono" />
                  <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
                    <Copy className="h-4 w-4 mr-1" />
                    {linkCopied ? t("resultCopied") : "Copier"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="font-semibold">{t("resultShare")}</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — ${arLink}`)}`} target="_blank" rel="noopener noreferrer">
                      {t("resultShareWhatsApp")}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(arLink)}`}>
                      {t("resultShareEmail")}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={arLink} target="_blank" rel="noopener noreferrer">
                      Voir en AR
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Embed */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="font-semibold">{t("resultEmbed")}</p>
                <div className="rounded-lg bg-muted p-3 font-mono text-xs break-all leading-relaxed">
                  {`<iframe src="${arLink}" width="400" height="500" frameborder="0" allow="camera; xr-spatial-tracking"></iframe>`}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<iframe src="${arLink}" width="400" height="500" frameborder="0" allow="camera; xr-spatial-tracking"></iframe>`
                    );
                    toast.success(t("resultCopied"));
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copier le code
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                {t("resultViewProduct")}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="flex-1 h-12" onClick={() => router.push(`/studio/${product.id}`)}>
                <Film className="h-4 w-4 mr-2" />
                {t("resultGenerateBreakout")}
              </Button>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {step === "failed" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-lg font-semibold">{t("failed")}</p>
              {errorMsg && <p className="text-sm text-muted-foreground text-center max-w-xs">{errorMsg}</p>}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("experience");
                    setProgressIndex(0);
                    setErrorMsg(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={() => startGeneration()}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
