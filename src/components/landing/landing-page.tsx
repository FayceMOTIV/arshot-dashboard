"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
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
  Box,
} from "lucide-react";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);

const HERO_GLB =
  "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";

const STEP_ICONS = [Camera, Sparkles, QrCode];
const FEATURE_ICONS = [Camera, ScanLine, Package, Smartphone, Share2, Sparkles];
const FEATURE_TINTS = [
  "bg-[#e8f0fe] text-[#0071e3]",
  "bg-[#f0ebff] text-[#7d7aff]",
  "bg-[#e6f7ee] text-[#1d9e54]",
  "bg-[#fdeee2] text-[#e07b1f]",
  "bg-[#e8f0fe] text-[#0071e3]",
  "bg-[#fdeef4] text-[#d4326c]",
];
const USECASE_ICONS = [Store, UtensilsCrossed, Hammer, Package];
const USECASE_IMAGES = [
  "/landing-sneaker-studio.jpg",
  "/landing-bottle.jpg",
  "/landing-chair.jpg",
  "/landing-lamp.jpg",
];
const PLAN_KEYS = ["free", "pro", "business"] as const;

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-lg">
        <Box className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="display-tight text-lg font-semibold tracking-tight text-[#1d1d1f]">
        ARShot
      </span>
    </Link>
  );
}

function PillCta({
  href,
  children,
  variant = "primary",
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  big?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-[#0071e3] text-white hover:bg-[#005bb5] shadow-[0_8px_24px_-8px_rgba(0,113,227,0.5)]"
      : "text-[#0071e3] hover:bg-[#0071e3]/8";
  return (
    <Link
      href={href}
      className={`pill inline-flex items-center gap-2 font-medium transition-all hover:scale-[1.03] active:scale-[0.98] ${
        big ? "px-7 py-3.5 text-lg" : "px-5 py-2.5 text-sm"
      } ${cls}`}
    >
      {children}
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
    <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* ── Header frosted (style icloud.com) ── */}
      <header className="frosted sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-xs font-medium text-[#6e6e73] lg:flex">
            <a href="#how" className="transition-colors hover:text-[#1d1d1f]">
              {t("navHow")}
            </a>
            <a href="#features" className="transition-colors hover:text-[#1d1d1f]">
              {t("navFeatures")}
            </a>
            <a href="#usecases" className="transition-colors hover:text-[#1d1d1f]">
              {t("navUseCases")}
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#1d1d1f]">
              {t("navPricing")}
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-xs font-medium text-[#1d1d1f] hover:text-[#0071e3] sm:block"
            >
              {t("navLogin")}
            </Link>
            <PillCta href="/products/new">{t("navCta")}</PillCta>
          </div>
        </div>
      </header>

      {/* ── Hero — produit sur podium, presque plein écran ── */}
      <section className="relative overflow-hidden">
        <div className="bg-aurora absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-16 text-center sm:px-8 sm:pt-24">
          <p className="anim-fade-up text-sm font-semibold tracking-wide text-[#0071e3]">
            {t("heroBadge")}
          </p>
          <h1
            className="display-tight anim-fade-up mx-auto mt-4 max-w-4xl font-semibold leading-[1.02]"
            style={{
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              animationDelay: "90ms",
            }}
          >
            {t("heroTitleA")}
            <br />
            <span className="text-gradient">{t("heroTitleB")}</span>
          </h1>
          <p
            className="anim-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6e6e73] sm:text-xl"
            style={{ animationDelay: "180ms" }}
          >
            {t("heroPitch")}
          </p>
          <div
            className="anim-fade-up mt-8 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "260ms" }}
          >
            <PillCta href="/products/new" big>
              {t("heroCtaPrimary")}
              <ArrowRight className="h-5 w-5" />
            </PillCta>
            <a href="#how" className="pill inline-flex items-center gap-2 px-7 py-3.5 text-lg font-medium text-[#0071e3] transition-all hover:scale-[1.03] hover:bg-[#0071e3]/8">
              {t("heroCtaSecondary")}
            </a>
          </div>

          {/* Podium */}
          <div
            className="anim-reveal relative mx-auto mt-6 max-w-3xl"
            style={{ animationDelay: "350ms" }}
          >
            <div className="halo-pastel absolute -inset-16 rounded-full blur-3xl" />
            <div className="relative h-[26rem] sm:h-[30rem]">
              <ModelViewer
                src={HERO_GLB}
                alt={t("heroDemoAlt")}
                autoRotate
                cameraControls
                ar
              />
            </div>
            {/* socle */}
            <div className="pointer-events-none mx-auto -mt-14 h-8 w-2/3 rounded-[100%] bg-black/10 blur-xl" />
            <p className="relative text-sm text-[#6e6e73]">
              {t("heroDemoTitle")} · {t("heroDemoHint")}
            </p>
          </div>

          {/* QR pill */}
          <div
            className="anim-fade-up mx-auto mt-10 flex w-fit items-center gap-4 rounded-[28px] border border-black/6 bg-white/80 p-4 pr-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            style={{ animationDelay: "450ms" }}
          >
            <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
              <QRCodeSVG value={arDemoUrl} size={72} level="M" fgColor="#1d1d1f" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{t("heroQrTitle")}</p>
              <p className="text-xs text-[#6e6e73]">{t("heroQrHint")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chiffres géants ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 text-center sm:grid-cols-3">
          {(["heroStat1", "heroStat2", "heroStat3"] as const).map((k, i) => (
            <div key={k} className="anim-fade-up" style={{ animationDelay: `${i * 110}ms` }}>
              <p
                className="display-tight font-semibold leading-none text-[#1d1d1f]"
                style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)" }}
              >
                {t(`${k}Value`)}
              </p>
              <p className="mt-3 text-lg text-[#6e6e73]">{t(`${k}Label`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comment ça marche — bento ── */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="anim-fade-up mb-12 max-w-2xl">
          <h2
            className="display-tight font-semibold leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {t("howTitle")}
          </h2>
          <p className="mt-3 text-xl text-[#6e6e73]">{t("howSubtitle")}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Carte wide : before/after MÊME produit */}
          <div className="anim-fade-up overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 lg:col-span-3">
            <div className="grid sm:grid-cols-[1fr_auto_1fr]">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing-sneaker-studio.jpg"
                  alt={t("howBeforeAlt")}
                  className="h-72 w-full object-cover sm:h-96"
                />
                <span className="pill absolute left-4 top-4 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] backdrop-blur-md">
                  {t("howPhotoLabel")}
                </span>
              </div>
              <div className="relative flex items-center justify-center bg-white px-2 py-4 sm:py-0">
                <div className="bg-brand-gradient flex h-12 w-12 rotate-90 items-center justify-center rounded-full text-white shadow-[0_10px_28px_-8px_rgba(0,113,227,0.55)] sm:rotate-0">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <div className="relative bg-[#fbfbfd]">
                <div className="h-72 sm:h-96">
                  <ModelViewer
                    src={HERO_GLB}
                    alt={t("howAfterAlt")}
                    autoRotate
                    cameraControls
                    variantName="beach"
                  />
                </div>
                <span className="pill absolute left-4 top-4 bg-[#0071e3] px-3.5 py-1.5 text-xs font-semibold text-white">
                  {t("howModelLabel")}
                </span>
              </div>
            </div>
          </div>

          {STEP_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="anim-fade-up group rounded-[28px] bg-white p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5"
              style={{ animationDelay: `${i * 110}ms` }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${FEATURE_TINTS[i]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="display-tight mt-5 text-xl font-semibold">
                {t(`howStep${i + 1}Title`)}
              </h3>
              <p className="mt-2 leading-relaxed text-[#6e6e73]">
                {t(`howStep${i + 1}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fonctionnalités — bento asymétrique ── */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="anim-fade-up mb-12 max-w-2xl">
          <h2
            className="display-tight font-semibold leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {t("featuresTitle")}
          </h2>
          <p className="mt-3 text-xl text-[#6e6e73]">{t("featuresSubtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_ICONS.map((Icon, i) => {
            const wide = i === 0 || i === 3;
            return (
              <div
                key={i}
                className={`anim-fade-up group rounded-[28px] bg-white p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5 ${
                  wide ? "lg:col-span-2" : ""
                }`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${FEATURE_TINTS[i]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="display-tight mt-5 text-xl font-semibold">
                  {t(`feature${i + 1}Title`)}
                  {i === 5 && (
                    <span className="pill ml-2.5 bg-[#f5f5f7] px-2.5 py-1 align-middle text-[11px] font-semibold text-[#6e6e73]">
                      {t("featureSoon")}
                    </span>
                  )}
                </h3>
                <p className="mt-2 leading-relaxed text-[#6e6e73]">
                  {t(`feature${i + 1}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Cas d'usage ── */}
      <section id="usecases" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="anim-fade-up mb-12 max-w-2xl">
          <h2
            className="display-tight font-semibold leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {t("useCasesTitle")}
          </h2>
          <p className="mt-3 text-xl text-[#6e6e73]">{t("useCasesSubtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USECASE_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="anim-fade-up group overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={USECASE_IMAGES[i]}
                  alt={t(`useCase${i + 1}Title`)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pill absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] backdrop-blur-md">
                  <Icon className="h-3.5 w-3.5 text-[#0071e3]" />
                  {t(`useCase${i + 1}Title`)}
                </div>
              </div>
              <div className="space-y-2 p-6">
                <p className="text-sm leading-relaxed text-[#6e6e73]">
                  {t(`useCase${i + 1}Desc`)}
                </p>
                <p className="text-sm font-semibold text-[#0071e3]">
                  {t(`useCase${i + 1}Stat`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="anim-fade-up mb-12 text-center">
          <h2
            className="display-tight font-semibold leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {t("pricingTitle")}
          </h2>
          <p className="mt-3 text-xl text-[#6e6e73]">{t("pricingSubtitle")}</p>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {PLAN_KEYS.map((plan, i) => {
            const highlighted = plan === "pro";
            return (
              <div
                key={plan}
                className={`anim-fade-up relative flex flex-col rounded-[28px] p-9 transition-transform duration-300 hover:-translate-y-1.5 ${
                  highlighted
                    ? "bg-[#1d1d1f] text-white shadow-[0_32px_80px_-30px_rgba(0,0,0,0.45)]"
                    : "bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                }`}
                style={{ animationDelay: `${i * 110}ms` }}
              >
                {highlighted && (
                  <span className="pill absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0071e3] px-4 py-1.5 text-xs font-semibold text-white">
                    {t("pricingPopular")}
                  </span>
                )}
                <h3 className="display-tight text-2xl font-semibold">
                  {t(`plan_${plan}_name`)}
                </h3>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="display-tight text-5xl font-semibold">
                    {t(`plan_${plan}_price`)}
                  </span>
                  <span className={highlighted ? "text-white/60" : "text-[#6e6e73]"}>
                    {t(`plan_${plan}_period`)}
                  </span>
                </div>
                <p className={`mt-2 ${highlighted ? "text-white/70" : "text-[#6e6e73]"}`}>
                  {t(`plan_${plan}_tagline`)}
                </p>
                <ul className="mt-7 flex-1 space-y-3.5">
                  {[1, 2, 3, 4].map((n) => {
                    const feature = t(`plan_${plan}_f${n}`);
                    if (!feature) return null;
                    return (
                      <li key={n} className="flex items-start gap-2.5 text-[15px]">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? "text-[#30d158]" : "text-[#1d9e54]"}`} />
                        <span className={highlighted ? "text-white/85" : ""}>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-9">
                  {highlighted ? (
                    <PillCta href="/products/new" big>
                      <span className="w-full text-center">{t(`plan_${plan}_cta`)}</span>
                    </PillCta>
                  ) : (
                    <Link
                      href="/products/new"
                      className="pill block w-full border border-[#0071e3]/30 px-7 py-3.5 text-center text-lg font-medium text-[#0071e3] transition-all hover:scale-[1.02] hover:bg-[#0071e3]/6"
                    >
                      {t(`plan_${plan}_cta`)}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA final — mesh pastel ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="bg-mesh-pastel anim-fade-up relative overflow-hidden rounded-[36px] px-8 py-20 text-center ring-1 ring-black/5 sm:py-28">
          <h2
            className="display-tight mx-auto max-w-3xl font-semibold leading-[1.05]"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
          >
            {t("finalTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-[#6e6e73]">
            {t("finalSubtitle")}
          </p>
          <div className="mt-9">
            <PillCta href="/products/new" big>
              {t("finalCta")}
              <ArrowRight className="h-5 w-5" />
            </PillCta>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 sm:flex-row sm:px-8">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6e6e73]">
            <a href="#how" className="hover:text-[#1d1d1f]">{t("navHow")}</a>
            <a href="#features" className="hover:text-[#1d1d1f]">{t("navFeatures")}</a>
            <a href="#pricing" className="hover:text-[#1d1d1f]">{t("navPricing")}</a>
            <Link href="/login" className="hover:text-[#1d1d1f]">{t("navLogin")}</Link>
          </nav>
          <p className="text-xs text-[#6e6e73]">{t("footerRights")}</p>
        </div>
      </footer>
    </div>
  );
}
