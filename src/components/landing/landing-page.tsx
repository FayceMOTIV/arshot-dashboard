"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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
  BadgeCheck,
  Cpu,
  Plug,
  FlaskConical,
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
  "/landing-table-restaurant.jpg",
  "/landing-chair.jpg",
  "/landing-lamp.jpg",
];
const PLAN_KEYS = ["free", "pro", "business"] as const;
const WORKSHOP_ICONS = [Package, ScanLine, BadgeCheck, Cpu, Smartphone, Plug];

function ArDemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && tryPlay()),
      { threshold: 0.1 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    >
      <source src="/ar-demo.webm" type="video/webm" />
      <source src="/ar-demo.mp4" type="video/mp4" />
    </video>
  );
}

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

  // Démo locale : en localhost on encode l'IP LAN du Mac pour que le QR soit
  // scannable depuis un téléphone sur le même Wi-Fi. Ailleurs, l'origin courant.
  const LAN_HOST = "192.168.10.117:3000";
  const [arScanUrl, setArScanUrl] = useState("");
  useEffect(() => {
    const { hostname, host, protocol } = window.location;
    const h = ["localhost", "127.0.0.1"].includes(hostname) ? LAN_HOST : host;
    const glb = `${protocol}//${h}/demo-waterbottle.glb`;
    setArScanUrl(
      `${protocol}//${h}/ar.html?glb=${encodeURIComponent(glb)}&name=${encodeURIComponent("Bouteille isotherme")}&demo=1`
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

      {/* ── Hero plein cadre — image full-bleed, écriture à gauche ── */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing-hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        {/* voile horizontal : opaque à gauche (zone texte), transparent à droite */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f5f7]/90 via-[#f5f5f7]/40 via-45% to-transparent" />
        {/* transition douce vers la section suivante */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f5f7] to-transparent" />

        <div className="relative flex w-full flex-1 flex-col px-6 pb-56 pt-24 text-left sm:pt-32 lg:pl-12 lg:pr-8 lg:pb-24">
          <div className="max-w-2xl">
            <p className="anim-fade-up text-sm font-semibold tracking-wide text-[#0071e3]">
              {t("heroBadge")}
            </p>
            <h1
              className="display-tight anim-fade-up mt-4 font-semibold leading-[1.02]"
              style={{
                fontSize: "clamp(3rem, 7vw, 6rem)",
                animationDelay: "90ms",
              }}
            >
              {t("heroTitleA")}
              <br />
              <span className="text-gradient">{t("heroTitleB")}</span>
            </h1>
            <p
              className="anim-fade-up mt-6 max-w-xl text-lg leading-relaxed text-[#4b4b50] sm:text-xl"
              style={{ animationDelay: "180ms" }}
            >
              {t("heroPitch")}
            </p>
            <div
              className="anim-fade-up mt-8 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "260ms" }}
            >
              <PillCta href="/products/new" big>
                {t("heroCtaPrimary")}
                <ArrowRight className="h-5 w-5" />
              </PillCta>
              <a href="#how" className="pill inline-flex items-center gap-2 bg-white/60 px-7 py-3.5 text-lg font-medium text-[#0071e3] backdrop-blur-md transition-all hover:scale-[1.03] hover:bg-white/80">
                {t("heroCtaSecondary")}
              </a>
            </div>
          </div>
        </div>

        {/* Carte glass flottante : le produit devient 3D + AR */}
        <div
          className="anim-reveal relative mx-auto -mt-52 w-[calc(100%-2.5rem)] max-w-sm lg:absolute lg:bottom-10 lg:right-10 lg:m-0 lg:w-[400px]"
          style={{ animationDelay: "380ms" }}
        >
          <div className="overflow-hidden rounded-[28px] border border-white/50 bg-white/60 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <div className="flex items-center justify-between px-5 pt-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#30d158]" />
                {t("heroDemoTitle")}
              </p>
              <p className="text-[11px] text-[#6e6e73]">{t("heroDemoHint")}</p>
            </div>
            <div className="h-56 sm:h-64">
              <ModelViewer
                src={HERO_GLB}
                alt={t("heroDemoAlt")}
                autoRotate
                cameraControls
                ar
                variantName="midnight"
              />
            </div>
            <div className="flex items-center gap-3 border-t border-black/6 bg-white/50 px-5 py-3.5">
              <div className="rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5">
                <QRCodeSVG value={arScanUrl || "https://arshot.fr"} size={56} level="M" fgColor="#1d1d1f" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t("heroQrTitle")}</p>
                <p className="text-xs text-[#6e6e73]">{t("heroQrHint")}</p>
              </div>
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
                  src="/landing-photo-produit.jpg"
                  alt={t("howBeforeAlt")}
                  className="h-72 w-full object-cover sm:h-96"
                  style={{ filter: "saturate(.92) contrast(.97)" }}
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
              <div className="relative bg-[#ececee]">
                <div className="h-72 sm:h-96">
                  <ModelViewer
                    src={HERO_GLB}
                    alt={t("howAfterAlt")}
                    autoRotate
                    cameraControls
                    variantName="midnight"
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

      {/* ── L'AR en action — vidéo ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="anim-fade-up mb-12 max-w-3xl">
          <h2
            className="display-tight font-semibold leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {t("arVideoTitle")}
          </h2>
          <p className="mt-4 text-xl leading-relaxed text-[#6e6e73]">
            {t("arVideoSubtitle")}
          </p>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="anim-fade-up group relative overflow-hidden rounded-[28px] bg-black shadow-[0_32px_80px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
            <ArDemoVideo />
            <span className="pill absolute bottom-4 left-4 bg-black/45 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              {t("arVideoCaption")}
            </span>
          </div>
          <div
            className="anim-fade-up flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-center justify-between px-6 pt-5">
              <p className="text-sm font-semibold">{t("arVideoRotate")}</p>
              <p className="text-xs text-[#6e6e73]">{t("heroDemoHint")}</p>
            </div>
            <div className="min-h-72 flex-1">
              <ModelViewer
                src="/demo-waterbottle.glb"
                alt={t("arVideoRotate")}
                autoRotate
                cameraControls
                ar
              />
            </div>
          </div>
        </div>

        {/* Grand QR — vivre la démo sur son téléphone */}
        <div
          className="anim-fade-up mt-5 flex flex-col items-center gap-6 rounded-[28px] bg-white p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 sm:flex-row sm:gap-10 sm:p-10"
          style={{ animationDelay: "200ms" }}
        >
          <div className="shrink-0 rounded-3xl bg-white p-4 shadow-[0_16px_44px_-16px_rgba(0,0,0,0.25)] ring-1 ring-black/8">
            {arScanUrl ? (
              <QRCodeSVG value={arScanUrl} size={168} level="M" fgColor="#1d1d1f" />
            ) : (
              <div className="h-[168px] w-[168px]" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="display-tight text-2xl font-semibold">
              {t("arScanTitle")}
            </h3>
            <p className="mt-2 max-w-md leading-relaxed text-[#6e6e73]">
              {t("arScanText")}
            </p>
            {arScanUrl && (
              <a
                href={arScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pill mt-5 inline-flex items-center gap-2 bg-[#0071e3] px-6 py-3 font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,113,227,0.5)] transition-all hover:scale-[1.03] hover:bg-[#005bb5]"
              >
                <Smartphone className="h-4 w-4" />
                {t("arScanMobile")}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Tout un atelier ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="anim-fade-up mb-12 max-w-2xl">
          <h2
            className="display-tight font-semibold leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            {t("workshopTitle")}
          </h2>
          <p className="mt-3 text-xl text-[#6e6e73]">{t("workshopSubtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WORKSHOP_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="anim-fade-up flex items-start gap-4 rounded-[28px] bg-white p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${FEATURE_TINTS[i]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="display-tight font-semibold">{t(`tool${i + 1}Title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6e6e73]">
                  {t(`tool${i + 1}Desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="anim-fade-up mt-8 text-center">
          <a
            href="/quality-lab.html"
            target="_blank"
            rel="noopener noreferrer"
            className="pill inline-flex items-center gap-2 border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-[#0071e3] transition-all hover:scale-[1.03] hover:bg-[#0071e3]/6"
          >
            <FlaskConical className="h-4 w-4" />
            {t("qualityLabLink")}
          </a>
        </div>
      </section>

      {/* ── Cas d'usage — mini-histoires ── */}
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
        <div className="space-y-6">
          {USECASE_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="anim-fade-up grid overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.15)] ring-1 ring-black/5 md:grid-cols-2"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className={`relative min-h-56 sm:min-h-72 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={USECASE_IMAGES[i]}
                  alt={t(`case${i + 1}Title`)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pill absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] backdrop-blur-md">
                  <Icon className="h-3.5 w-3.5 text-[#0071e3]" />
                  {t(`case${i + 1}Title`)}
                </div>
              </div>
              <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
                <h3 className="display-tight text-2xl font-semibold">
                  {t(`case${i + 1}Title`)}
                </h3>
                <p className="text-lg italic leading-snug text-[#6e6e73]">
                  « {t(`case${i + 1}Problem`)} »
                </p>
                <p className="font-medium leading-snug">
                  {t(`case${i + 1}Solution`)}
                </p>
                <div>
                  <p className="text-sm font-bold text-[#0071e3]">
                    {t(`case${i + 1}Stat`)}
                  </p>
                  {t(`case${i + 1}StatSource`) && (
                    <p className="mt-0.5 text-[11px] text-[#6e6e73]">
                      {t(`case${i + 1}StatSource`)}
                    </p>
                  )}
                </div>
                <p className="rounded-2xl bg-[#f5f5f7] px-5 py-3.5 text-sm leading-relaxed text-[#4b4b50]">
                  {t(`case${i + 1}Example`)}
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
