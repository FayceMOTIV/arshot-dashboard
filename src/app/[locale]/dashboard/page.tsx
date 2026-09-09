"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, getDashboardAnalytics, getArLink } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Plus,
  Package,
  ScanLine,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  QrCode,
  PackageOpen,
  BarChart3,
  Smartphone,
} from "lucide-react";
import type { ARModel } from "@/types";
import { cn } from "@/lib/utils";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);

const DEMO_GLB =
  "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";

interface RealStats {
  totalProducts: number;
  readyProducts: number;
  totalScans: number;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [products, setProducts] = useState<ARModel[]>([]);
  const [stats, setStats] = useState<RealStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [list, analytics] = await Promise.all([
          getProducts().catch(() => [] as ARModel[]),
          getDashboardAnalytics().catch(() => null),
        ]);
        setProducts(list);
        setStats({
          totalProducts: list.length,
          readyProducts: list.filter((p) => p.status === "ready").length,
          totalScans:
            analytics?.totalScans ??
            list.reduce((sum, p) => sum + p.scanCount, 0),
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const firstName = user?.displayName?.split(" ")[0] || "";

  const demoProduct = products.find((p) => p.status === "ready" && p.glbUrl);
  const customerViewGlb = demoProduct?.glbUrl ?? DEMO_GLB;
  const customerViewShortId = demoProduct?.shortId || demoProduct?.id;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero */}
        <section className="anim-fade-up bg-brand-gradient relative overflow-hidden rounded-3xl p-8 text-white sm:p-10">
          <div className="bg-noise absolute inset-0" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative space-y-4">
            <p className="text-sm font-medium text-white/70">
              {t("greeting", { name: firstName ? ` ${firstName}` : "" })}
            </p>
            <h1 className="display-tight max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
              {t("heroTitle")}
            </h1>
            <p className="max-w-md text-white/80">{t("heroSubtitle")}</p>
            <Link href="/products/new">
              <Button className="mt-2 h-12 gap-2 border-0 bg-white text-[#0a0a0f] hover:bg-white/90 font-semibold">
                <Plus className="h-5 w-5" />
                {t("createProduct")}
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick actions */}
        <section className="space-y-4">
          <h2 className="display-tight anim-fade-up text-xl font-bold">
            {t("quickActions")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Plus,
                label: t("qaCreate"),
                desc: t("qaCreateDesc"),
                href: "/products/new" as const,
                primary: true,
              },
              {
                icon: QrCode,
                label: t("qaQr"),
                desc: t("qaQrDesc"),
                href: "/products" as const,
                primary: false,
              },
              {
                icon: PackageOpen,
                label: t("qaExport"),
                desc: t("qaExportDesc"),
                href: demoProduct ? (`/products/${demoProduct.id}` as const) : ("/products" as const),
                primary: false,
              },
              {
                icon: BarChart3,
                label: t("qaStats"),
                desc: t("qaStatsDesc"),
                href: "/analytics" as const,
                primary: false,
              },
            ].map((action, i) => (
              <Link key={action.label} href={action.href}>
                <div
                  className={cn(
                    "hover-lift anim-fade-up flex h-full items-start gap-4 rounded-2xl p-5",
                    action.primary ? "border-gradient glass glow-soft" : "glass"
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      action.primary
                        ? "bg-brand-gradient glow-primary"
                        : "bg-primary/15"
                    )}
                  >
                    <action.icon
                      className={cn(
                        "h-5 w-5",
                        action.primary ? "text-white" : "text-primary"
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{action.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Customer view */}
        <section
          className="glass anim-fade-up relative overflow-hidden rounded-3xl"
          style={{ animationDelay: "200ms" }}
        >
          <div className="bg-aurora absolute inset-0" />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col justify-center space-y-4">
              <p className="text-gradient text-xs font-bold uppercase tracking-widest">
                {t("customerViewDemo")}
              </p>
              <h2 className="display-tight text-2xl font-bold sm:text-3xl">
                {t("customerView")}
              </h2>
              <p className="max-w-md text-muted-foreground">
                {t("customerViewDesc")}
              </p>
              {customerViewShortId ? (
                <a
                  href={getArLink(customerViewShortId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit"
                >
                  <Button className="bg-brand-gradient hover:opacity-90 gap-2 border-0 text-white glow-primary">
                    <Smartphone className="h-4 w-4" />
                    {t("customerViewCta")}
                  </Button>
                </a>
              ) : (
                <Link href="/products/new" className="w-fit">
                  <Button className="bg-brand-gradient hover:opacity-90 gap-2 border-0 text-white glow-primary">
                    <Plus className="h-4 w-4" />
                    {t("createProduct")}
                  </Button>
                </Link>
              )}
            </div>
            <div className="border-gradient relative h-72 overflow-hidden rounded-2xl sm:h-80">
              <ModelViewer
                src={customerViewGlb}
                alt={demoProduct?.name ?? "ARShot"}
                iosSrc={demoProduct?.usdzUrl ?? undefined}
                autoRotate
                cameraControls
                ar
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer h-28 rounded-2xl" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: t("statProducts"), value: stats.totalProducts, icon: Package },
              { label: t("statReady"), value: stats.readyProducts, icon: BadgeCheck },
              { label: t("statScans"), value: stats.totalScans, icon: ScanLine },
            ].map((card, i) => (
              <div
                key={card.label}
                className={cn(
                  "glass hover-lift anim-fade-up flex items-center gap-4 rounded-2xl p-6"
                )}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="bg-brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="display-tight text-3xl font-bold">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Products */}
        {!loading && (
          <section className="space-y-4">
            <div className="anim-fade-up flex items-center justify-between">
              <h2 className="display-tight text-xl font-bold">{t("recentProducts")}</h2>
              {products.length > 0 && (
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {t("viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div className="glass anim-scale-in relative overflow-hidden rounded-3xl">
                <div className="bg-aurora absolute inset-0" />
                <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
                  <div className="space-y-4 text-center lg:text-left">
                    <div className="bg-brand-gradient anim-float mx-auto flex h-20 w-20 items-center justify-center rounded-3xl glow-primary lg:mx-0">
                      <Sparkles className="h-9 w-9 text-white" />
                    </div>
                    <h3 className="display-tight text-2xl font-bold">{t("emptyTitle")}</h3>
                    <p className="mx-auto max-w-sm text-muted-foreground lg:mx-0">{t("emptyDesc")}</p>
                    <Link href="/products/new" className="inline-block">
                      <Button className="bg-brand-gradient hover:opacity-90 h-12 gap-2 border-0 text-white glow-primary">
                        <Plus className="h-5 w-5" />
                        {t("emptyCta")}
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <p className="text-center text-sm font-semibold text-muted-foreground lg:text-left">
                      {t("emptyDemoTitle")}
                    </p>
                    <div className="border-gradient h-64 overflow-hidden rounded-2xl sm:h-72">
                      <ModelViewer src={DEMO_GLB} alt="ARShot" autoRotate cameraControls ar />
                    </div>
                    <p className="text-center text-xs text-muted-foreground lg:text-left">
                      {t("emptyDemoDesc")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.slice(0, 8).map((model, i) => (
                  <div
                    key={model.id}
                    className="anim-fade-up"
                    style={{ animationDelay: `${Math.min(i, 7) * 70}ms` }}
                  >
                    <ProductCard model={model} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
