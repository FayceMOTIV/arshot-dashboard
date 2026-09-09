"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import {
  Box,
  Camera,
  Sparkles,
  QrCode,
  ScanLine,
  Package,
  Share2,
  Smartphone,
  Store,
  UtensilsCrossed,
  Hammer,
  ArrowRight,
  Check,
  Play,
} from "lucide-react";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);

const HERO_GLB =
  "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";
const COMPARE_GLB =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb";

const STEP_ICONS = [Camera, Sparkles, QrCode];
const FEATURE_ICONS = [Camera, ScanLine, Package, Smartphone, Share2, Sparkles];
const USECASE_ICONS = [Store, UtensilsCrossed, Hammer, Package];
const USECASE_IMAGES = [
  "/landing-sneaker.jpg",
  "/landing-bottle.jpg",
  "/landing-chair.jpg",
  "/landing-lamp.jpg",
];
const PLAN_KEYS = ["free", "pro", "business"] as const;

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl glow-primary">
        <Box className="h-4.5 w-4.5 text-white" />
      </div>
      <span className="display-tight text-xl font-bold tracking-tight">
        AR<span className="text-gradient">Shot</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  const t = useTranslations("landing");

  const [arDemoUrl, setArDemoUrl] = useState(
    `/ar.html?glb=${encodeURIComponent(HERO_GLB)}`
  );
  useEffect(() => {
    setArDemoUrl(
      `${window.location.origin}/ar.html?glb=${encodeURIComponent(HERO_GLB)}`
    );
  }, []);

  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <div className="bg-aurora pointer-events-none fixed inset-0" />
      <div className="bg-noise pointer-events-none fixed inset-0" />

      {/* ── Header ── */}
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              {t("navHow")}
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              {t("navFeatures")}
            </a>
            <a href="#usecases" className="transition-colors hover:text-foreground">
              {t("navUseCases")}
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              {t("navPricing")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                {t("navLogin")}
              </Button>
            </Link>
            <Link href="/products/new">
              <Button className="bg-brand-gradient hover:opacity-90 gap-2 border-0 text-white glow-primary">
                {t("navCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-full" />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-7">
            <div className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
              <span className="bg-brand-gradient h-1.5 w-1.5 rounded-full" />
              {t("heroBadge")}
            </div>
            <h1
              className="display-tight anim-fade-up text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              {t("heroTitleA")}{" "}
              <span className="text-gradient">{t("heroTitleB")}</span>
            </h1>
            <p
              className="anim-fade-up max-w-xl text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "160ms" }}
            >
              {t("heroPitch")}
            </p>
            <div
              className="anim-fade-up flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <Link href="/products/new">
                <Button className="bg-brand-gradient hover:opacity-90 h-12 gap-2 border-0 px-6 text-base font-semibold text-white glow-primary">
                  <Play className="h-4 w-4" />
                  {t("heroCtaPrimary")}
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" className="h-12 px-6 text-base">
                  {t("heroCtaSecondary")}
                </Button>
              </a>
            </div>
            <div
              className="anim-fade-up flex flex-wrap gap-x-8 gap-y-3 pt-2"
              style={{ animationDelay: "320ms" }}
            >
              {(["heroStat1", "heroStat2", "heroStat3"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2 text-sm">
                  <span className="text-gradient display-tight text-xl font-bold">
                    {t(`${k}Value`)}
                  </span>
                  <span className="max-w-[10rem] text-muted-foreground">
                    {t(`${k}Label`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live demo — try it right now */}
          <div className="anim-scale-in relative" style={{ animationDelay: "200ms" }}>
            <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,color-mix(in_srgb,var(--electric)_18%,transparent),transparent_70%)] blur-2xl" />
            <div className="glass border-gradient relative overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {t("heroDemoTitle")}
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {t("heroDemoHint")}
                </p>
              </div>
              <div className="relative h-80 sm:h-96">
                <ModelViewer src={HERO_GLB} alt={t("heroDemoAlt")} autoRotate cameraControls ar />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-1.5">
                    <QRCodeSVG value={arDemoUrl} size={64} level="M" fgColor="#050508" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t("heroQrTitle")}</p>
                    <p className="text-xs text-muted-foreground">{t("heroQrHint")}</p>
                  </div>
                </div>
                <QrCode className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="how" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="anim-fade-up mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="display-tight text-3xl font-bold sm:text-4xl">{t("howTitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("howSubtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEP_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="glass hover-lift anim-fade-up relative rounded-3xl p-7"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="text-gradient display-tight absolute right-6 top-5 text-5xl font-bold opacity-40">
                {i + 1}
              </span>
              <div className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl glow-primary">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="display-tight mt-5 text-xl font-bold">
                {t(`howStep${i + 1}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`howStep${i + 1}Desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* Before / After */}
        <div className="anim-fade-up mt-14 grid items-stretch gap-6 lg:grid-cols-2">
          <div className="glass relative overflow-hidden rounded-3xl">
            <div className="border-b border-border px-5 py-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {t("howBeforeLabel")}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing-sneaker.jpg"
              alt={t("howBeforeAlt")}
              className="h-80 w-full object-cover sm:h-[26rem]"
            />
          </div>
          <div className="glass border-gradient relative overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-semibold">
                <span className="text-gradient">{t("howAfterLabel")}</span>
              </p>
              <p className="text-xs text-muted-foreground">{t("heroDemoHint")}</p>
            </div>
            <div className="h-80 sm:h-[26rem]">
              <ModelViewer src={COMPARE_GLB} alt={t("howAfterAlt")} autoRotate cameraControls />
            </div>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section id="features" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="anim-fade-up mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="display-tight text-3xl font-bold sm:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("featuresSubtitle")}</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="glass hover-lift anim-fade-up group rounded-3xl p-7"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="display-tight mt-4 text-lg font-bold">
                {t(`feature${i + 1}Title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(`feature${i + 1}Desc`)}
              </p>
              {i === 5 && (
                <span className="mt-3 inline-block rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {t("featureSoon")}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Cas d'usage ── */}
      <section id="usecases" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="anim-fade-up mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="display-tight text-3xl font-bold sm:text-4xl">
            {t("useCasesTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("useCasesSubtitle")}</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USECASE_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="glass hover-lift anim-fade-up group overflow-hidden rounded-3xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={USECASE_IMAGES[i]}
                  alt={t(`useCase${i + 1}Title`)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="glass absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="space-y-2 p-5">
                <h3 className="display-tight font-bold">{t(`useCase${i + 1}Title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`useCase${i + 1}Desc`)}
                </p>
                <p className="text-gradient text-sm font-bold">
                  {t(`useCase${i + 1}Stat`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="anim-fade-up mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="display-tight text-3xl font-bold sm:text-4xl">{t("pricingTitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("pricingSubtitle")}</p>
        </div>
        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {PLAN_KEYS.map((plan, i) => {
            const highlighted = plan === "pro";
            return (
              <div
                key={plan}
                className={
                  highlighted
                    ? "glass border-gradient hover-lift anim-fade-up relative flex flex-col rounded-3xl p-8 glow-primary"
                    : "glass hover-lift anim-fade-up relative flex flex-col rounded-3xl p-8"
                }
                style={{ animationDelay: `${i * 110}ms` }}
              >
                {highlighted && (
                  <span className="bg-brand-gradient absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white">
                    {t("pricingPopular")}
                  </span>
                )}
                <h3 className="display-tight text-xl font-bold">
                  {t(`plan_${plan}_name`)}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="display-tight text-4xl font-bold">
                    {t(`plan_${plan}_price`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t(`plan_${plan}_period`)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`plan_${plan}_tagline`)}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {[1, 2, 3, 4].map((n) => {
                    const feature = t(`plan_${plan}_f${n}`);
                    if (!feature) return null;
                    return (
                      <li key={n} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/products/new" className="mt-8 block">
                  <Button
                    className={
                      highlighted
                        ? "bg-brand-gradient hover:opacity-90 h-12 w-full border-0 font-semibold text-white glow-primary"
                        : "h-12 w-full"
                    }
                    variant={highlighted ? "default" : "outline"}
                  >
                    {t(`plan_${plan}_cta`)}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="bg-brand-gradient anim-fade-up relative overflow-hidden rounded-[2.5rem] p-10 text-center text-white sm:p-16">
          <div className="bg-noise absolute inset-0" />
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative space-y-6">
            <h2 className="display-tight mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
              {t("finalTitle")}
            </h2>
            <p className="mx-auto max-w-xl text-white/80">{t("finalSubtitle")}</p>
            <Link href="/products/new">
              <Button className="h-13 gap-2 border-0 bg-white px-8 text-base font-semibold text-[#0a0a0f] hover:bg-white/90">
                <Play className="h-4 w-4" />
                {t("finalCta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-8">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#how" className="transition-colors hover:text-foreground">
              {t("navHow")}
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              {t("navFeatures")}
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              {t("navPricing")}
            </a>
            <Link href="/login" className="transition-colors hover:text-foreground">
              {t("navLogin")}
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">{t("footerRights")}</p>
        </div>
      </footer>
    </div>
  );
}
