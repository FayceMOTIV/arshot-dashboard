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
  ArrowUpRight,
  Check,
  BadgeCheck,
  Cpu,
  Plug,
  FlaskConical,
} from "lucide-react";

const ModelViewer = dynamic(
  () => import("@/components/products/model-viewer-element"),
  { ssr: false }
);

// Vraie génération ARShot (Hunyuan 3D v3.1 Pro, ~3 min) depuis /demo/sneaker-source-full.jpg
const HERO_GLB = "/demo/sneaker-hunyuan-pro.glb";
const HERO_PHOTO = "/demo/sneaker-source-full.jpg";

const STEP_ICONS = [Camera, Sparkles, QrCode];
const FEATURE_ICONS = [Camera, ScanLine, Package, Smartphone, Share2, Sparkles];
const USECASE_ICONS = [Store, UtensilsCrossed, Hammer, Package];
const USECASE_IMAGES = [
  "/landing-sneaker-studio.jpg",
  "/landing-table-restaurant.jpg",
  "/landing-chair.jpg",
  "/landing-lamp.jpg",
];
const PLAN_KEYS = ["free", "pro", "business"] as const;
const WORKSHOP_ICONS = [Package, ScanLine, BadgeCheck, Cpu, Smartphone, Plug];

const EASE = "cubic-bezier(0.22,1,0.36,1)";

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

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-baseline gap-0.5">
      <span
        className="display-tight text-2xl"
        style={{ color: light ? "#faf8f3" : "#16130e" }}
      >
        ARShot
      </span>
      <span className="text-2xl leading-none text-[#c2410c]">.</span>
    </Link>
  );
}

function InkCta({
  href,
  children,
  big = false,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  big?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 font-medium transition-all duration-500 hover:gap-4 ${
        big ? "px-8 py-4 text-lg" : "px-5 py-2.5 text-sm"
      } ${
        light
          ? "bg-[#faf8f3] text-[#16130e] hover:bg-white"
          : "bg-[#16130e] text-[#faf8f3] hover:bg-[#c2410c]"
      }`}
      style={{ borderRadius: 999, transitionTimingFunction: EASE }}
    >
      {children}
    </Link>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  index: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="anim-fade-up mb-14">
      <div
        className="flex items-baseline gap-4 border-t pb-6 pt-4"
        style={{
          borderColor: light ? "rgba(250,248,243,0.2)" : "rgba(22,19,14,0.14)",
        }}
      >
        <span className="folio text-sm tracking-wide">{index}</span>
        {eyebrow && (
          <span
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: light ? "rgba(250,248,243,0.55)" : "#6f6a5e" }}
          >
            {eyebrow}
          </span>
        )}
      </div>
      <h2
        className="display-tight mt-6 max-w-3xl leading-[1.04]"
        style={{
          fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
          color: light ? "#faf8f3" : "#16130e",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-4 max-w-xl text-lg leading-relaxed"
          style={{ color: light ? "rgba(250,248,243,0.6)" : "#6f6a5e" }}
        >
          {subtitle}
        </p>
      )}
    </div>
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
    const base = `${protocol}//${h}`;
    const glb = `${base}/demo-pancakes.glb`;
    const usdz = `${base}/demo-pancakes.usdz`;
    setArScanUrl(
      `${base}/ar.html?glb=${encodeURIComponent(glb)}&usdz=${encodeURIComponent(usdz)}&name=${encodeURIComponent("Pancakes aux myrtilles")}&demo=1`
    );
  }, []);

  return (
    <div className="relative min-h-screen bg-[#faf8f3] text-[#16130e]">
      {/* ── Header : filet fin, wordmark serif ── */}
      <header className="sticky top-0 z-50 border-b border-[#16130e]/10 bg-[#faf8f3]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <nav className="hidden items-center gap-9 text-[13px] font-medium text-[#6f6a5e] lg:flex">
            {[
              ["#proof", t("navProof")],
              ["#how", t("navHow")],
              ["#usecases", t("navUseCases")],
              ["#pricing", t("navPricing")],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="tracking-wide transition-colors duration-300 hover:text-[#16130e]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-4 py-2 text-[13px] font-medium text-[#16130e] transition-colors hover:text-[#c2410c] sm:block"
            >
              {t("navLogin")}
            </Link>
            <InkCta href="/products/new">{t("navCta")}</InkCta>
          </div>
        </div>
      </header>

      {/* ── Hero éditorial : grand titre serif + vraie génération ── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="anim-fade-up flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f6a5e]">
              <span className="inline-block h-px w-10 bg-[#c2410c]" />
              {t("heroBadge")}
            </p>
            <h1
              className="display-tight anim-fade-up mt-7 leading-[0.98]"
              style={{ fontSize: "clamp(3.2rem, 8vw, 7rem)", animationDelay: "100ms" }}
            >
              {t("heroTitleA")}
              <br />
              <em className="italic text-[#c2410c]">{t("heroTitleB")}</em>
            </h1>
            <p
              className="anim-fade-up mt-8 max-w-lg text-lg leading-relaxed text-[#6f6a5e] sm:text-xl"
              style={{ animationDelay: "200ms" }}
            >
              {t("heroPitch")}
            </p>
            <div
              className="anim-fade-up mt-10 flex flex-wrap items-center gap-6"
              style={{ animationDelay: "300ms" }}
            >
              <InkCta href="/products/new" big>
                {t("heroCtaPrimary")}
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
              </InkCta>
              <a
                href="#proof"
                className="group inline-flex items-center gap-2 border-b border-[#16130e]/25 pb-1 text-base font-medium transition-colors duration-300 hover:border-[#c2410c] hover:text-[#c2410c]"
              >
                {t("heroCtaSecondary")}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Fig. 01 — la preuve, tout de suite */}
          <div className="anim-reveal lg:col-span-5" style={{ animationDelay: "420ms" }}>
            <figure className="border border-[#16130e]/12 bg-[#fffdf9]">
              <figcaption className="flex items-center justify-between border-b border-[#16130e]/10 px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6a5e]">
                  {t("heroFigCaption")}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#c2410c]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c2410c]" />
                  {t("heroDemoTitle")}
                </span>
              </figcaption>
              <div className="h-72 sm:h-80">
                <ModelViewer
                  src={HERO_GLB}
                  alt={t("heroDemoAlt")}
                  autoRotate
                  cameraControls
                  ar
                />
              </div>
              <div className="flex items-center gap-4 border-t border-[#16130e]/10 px-5 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_PHOTO}
                  alt={t("heroSourceLabel")}
                  className="h-14 w-14 rounded-md border border-[#16130e]/10 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f6a5e]">
                    {t("heroSourceLabel")}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-[#16130e]">
                    {t("heroProof")}
                  </p>
                </div>
              </div>
            </figure>
          </div>
        </div>

        {/* Chiffres en bandeau, séparés par des filets */}
        <div className="mt-20 grid border-y border-[#16130e]/12 sm:grid-cols-3">
          {(["heroStat1", "heroStat2", "heroStat3"] as const).map((k, i) => (
            <div
              key={k}
              className={`anim-fade-up px-6 py-10 text-center sm:py-12 ${
                i > 0 ? "border-t border-[#16130e]/12 sm:border-l sm:border-t-0" : ""
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <p
                className="display-tight leading-none text-[#16130e]"
                style={{ fontSize: "clamp(3.25rem, 6vw, 5.5rem)" }}
              >
                {t(`${k}Value`)}
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.16em] text-[#6f6a5e]">
                {t(`${k}Label`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 01 La preuve : la photo → le modèle, même produit ── */}
      <section id="proof" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <SectionHeading
          index="01"
          eyebrow={t("proofEyebrow")}
          title={t("proofTitle")}
          subtitle={t("proofText")}
        />
        <div className="anim-fade-up overflow-hidden border border-[#16130e]/12 bg-[#fffdf9]">
          <div className="grid sm:grid-cols-[1fr_auto_1fr]">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_PHOTO}
                alt={t("howBeforeAlt")}
                className="h-80 w-full object-cover sm:h-[26rem]"
              />
              <span className="absolute left-5 top-5 border border-[#16130e]/15 bg-[#faf8f3]/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm">
                {t("howPhotoLabel")}
              </span>
            </div>
            <div className="relative flex items-center justify-center border-y border-[#16130e]/10 px-3 py-5 sm:border-x sm:border-y-0 sm:py-0">
              <div className="flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-[#16130e] text-[#faf8f3] sm:rotate-0">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <div className="relative bg-[#f3efe7]">
              <div className="h-80 sm:h-[26rem]">
                <ModelViewer
                  src={HERO_GLB}
                  alt={t("howAfterAlt")}
                  autoRotate
                  cameraControls
                />
              </div>
              <span className="absolute left-5 top-5 bg-[#c2410c] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#faf8f3]">
                {t("howModelLabel")}
              </span>
            </div>
          </div>
          <p className="border-t border-[#16130e]/10 px-5 py-3.5 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#6f6a5e]">
            {t("proofBadge")}
          </p>
        </div>

        {/* Comment ça marche — 3 folios */}
        <div id="how" className="mt-20 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {STEP_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="anim-fade-up border-t border-[#16130e]/15 pt-6"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="flex items-baseline justify-between">
                <span className="folio display-tight text-5xl leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="h-5 w-5 text-[#6f6a5e]" />
              </div>
              <h3 className="display-tight mt-6 text-2xl">
                {t(`howStep${i + 1}Title`)}
              </h3>
              <p className="mt-3 leading-relaxed text-[#6f6a5e]">
                {t(`howStep${i + 1}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 L'AR en action — bloc encre, moment sombre ── */}
      <section className="bg-[#16130e] text-[#faf8f3]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            index="02"
            eyebrow={t("arEyebrow")}
            title={t("arVideoTitle")}
            subtitle={t("arVideoSubtitle")}
            light
          />
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="anim-fade-up group relative overflow-hidden border border-[#faf8f3]/15">
              <ArDemoVideo />
              <span className="absolute bottom-4 left-4 bg-[#16130e]/60 px-3.5 py-1.5 text-xs font-medium text-[#faf8f3] backdrop-blur-md">
                {t("arVideoCaption")}
              </span>
            </div>
            <div
              className="anim-fade-up flex flex-col border border-[#faf8f3]/15 bg-[#1d1912]"
              style={{ animationDelay: "140ms" }}
            >
              <div className="flex items-center justify-between border-b border-[#faf8f3]/10 px-6 py-4">
                <p className="text-sm font-semibold">{t("arVideoRotate")}</p>
                <p className="text-xs text-[#faf8f3]/50">{t("heroDemoHint")}</p>
              </div>
              <div className="min-h-72 flex-1">
                <ModelViewer
                  src="/demo-pancakes.glb"
                  alt={t("arVideoRotate")}
                  iosSrc="/demo-pancakes.usdz"
                  autoRotate
                  cameraControls
                  ar
                />
              </div>
            </div>
          </div>

          {/* Grand QR */}
          <div
            className="anim-fade-up mt-6 flex flex-col items-center gap-8 border border-[#faf8f3]/15 p-8 sm:flex-row sm:gap-12 sm:p-12"
            style={{ animationDelay: "220ms" }}
          >
            <div className="shrink-0 bg-[#faf8f3] p-4">
              {arScanUrl ? (
                <QRCodeSVG value={arScanUrl} size={160} level="M" fgColor="#16130e" />
              ) : (
                <div className="h-[160px] w-[160px]" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="display-tight text-3xl">{t("arScanTitle")}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-[#faf8f3]/60">
                {t("arScanText")}
              </p>
              {arScanUrl && (
                <a
                  href={arScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 bg-[#faf8f3] px-6 py-3 font-medium text-[#16130e] transition-colors duration-300 hover:bg-[#c2410c] hover:text-[#faf8f3]"
                  style={{ borderRadius: 999 }}
                >
                  <Smartphone className="h-4 w-4" />
                  {t("arScanMobile")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 L'atelier — liste éditoriale à filets ── */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading
          index="03"
          eyebrow={t("workshopEyebrow")}
          title={t("workshopTitle")}
          subtitle={t("workshopSubtitle")}
        />
        <div className="border-t border-[#16130e]/12">
          {WORKSHOP_ICONS.map((Icon, i) => (
            <div
              key={i}
              className="anim-fade-up group grid items-start gap-3 border-b border-[#16130e]/12 py-7 transition-colors duration-500 hover:bg-[#fffdf9] sm:grid-cols-[3.5rem_3.5rem_1fr_2fr] sm:items-baseline sm:gap-6"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="folio pl-1 text-sm sm:pl-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Icon className="h-5 w-5 text-[#6f6a5e] transition-colors duration-300 group-hover:text-[#c2410c]" />
              <h3 className="display-tight text-2xl">{t(`tool${i + 1}Title`)}</h3>
              <p className="pr-2 leading-relaxed text-[#6f6a5e] sm:pr-6">
                {t(`tool${i + 1}Desc`)}
              </p>
            </div>
          ))}
        </div>
        <div className="anim-fade-up mt-8 text-center">
          <a
            href="/quality-lab.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#16130e]/20 px-5 py-2.5 text-sm font-medium text-[#16130e] transition-colors duration-300 hover:border-[#c2410c] hover:text-[#c2410c]"
            style={{ borderRadius: 999 }}
          >
            <FlaskConical className="h-4 w-4" />
            {t("qualityLabLink")}
          </a>
        </div>
      </section>

      {/* ── 04 Cas d'usage — histoires numérotées ── */}
      <section id="usecases" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <SectionHeading
          index="04"
          eyebrow={t("casesEyebrow")}
          title={t("useCasesTitle")}
          subtitle={t("useCasesSubtitle")}
        />
        <div className="space-y-6">
          {USECASE_ICONS.map((Icon, i) => (
            <article
              key={i}
              className="anim-fade-up grid overflow-hidden border border-[#16130e]/12 bg-[#fffdf9] transition-transform duration-500 md:grid-cols-2"
              style={{ animationDelay: `${i * 90}ms`, transitionTimingFunction: EASE }}
            >
              <div className={`relative min-h-64 sm:min-h-80 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={USECASE_IMAGES[i]}
                  alt={t(`case${i + 1}Title`)}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  style={{ transitionTimingFunction: EASE }}
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-[#faf8f3]/90 px-3.5 py-1.5 text-xs font-semibold text-[#16130e] backdrop-blur-sm">
                  <Icon className="h-3.5 w-3.5 text-[#c2410c]" />
                  {t(`case${i + 1}Title`)}
                </div>
              </div>
              <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
                <span className="folio text-sm">
                  {String(i + 1).padStart(2, "0")} / 04
                </span>
                <h3 className="display-tight text-3xl">{t(`case${i + 1}Title`)}</h3>
                <p className="display-tight text-xl italic leading-snug text-[#6f6a5e]">
                  « {t(`case${i + 1}Problem`)} »
                </p>
                <p className="font-medium leading-snug">{t(`case${i + 1}Solution`)}</p>
                <div>
                  <p className="text-sm font-bold text-[#c2410c]">{t(`case${i + 1}Stat`)}</p>
                  {t(`case${i + 1}StatSource`) && (
                    <p className="mt-0.5 text-[11px] text-[#6f6a5e]">
                      {t(`case${i + 1}StatSource`)}
                    </p>
                  )}
                </div>
                <p className="border-l-2 border-[#c2410c] pl-4 text-sm leading-relaxed text-[#4b463c]">
                  {t(`case${i + 1}Example`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 05 Tarifs ── */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <SectionHeading
          index="05"
          eyebrow={t("pricingEyebrow")}
          title={t("pricingTitle")}
          subtitle={t("pricingSubtitle")}
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {PLAN_KEYS.map((plan, i) => {
            const highlighted = plan === "pro";
            return (
              <div
                key={plan}
                className={`anim-fade-up relative flex flex-col p-9 transition-transform duration-500 hover:-translate-y-1.5 ${
                  highlighted
                    ? "bg-[#16130e] text-[#faf8f3]"
                    : "border border-[#16130e]/12 bg-[#fffdf9]"
                }`}
                style={{ animationDelay: `${i * 120}ms`, transitionTimingFunction: EASE }}
              >
                {highlighted && (
                  <span className="absolute -top-3 left-8 bg-[#c2410c] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#faf8f3]">
                    {t("pricingPopular")}
                  </span>
                )}
                <h3 className="display-tight text-2xl">{t(`plan_${plan}_name`)}</h3>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="display-tight text-6xl leading-none">
                    {t(`plan_${plan}_price`)}
                  </span>
                  <span className={highlighted ? "text-[#faf8f3]/50" : "text-[#6f6a5e]"}>
                    {t(`plan_${plan}_period`)}
                  </span>
                </div>
                <p className={`mt-3 ${highlighted ? "text-[#faf8f3]/60" : "text-[#6f6a5e]"}`}>
                  {t(`plan_${plan}_tagline`)}
                </p>
                <ul
                  className={`mt-8 flex-1 space-y-3.5 border-t pt-7 ${
                    highlighted ? "border-[#faf8f3]/15" : "border-[#16130e]/10"
                  }`}
                >
                  {[1, 2, 3, 4].map((n) => {
                    const feature = t(`plan_${plan}_f${n}`);
                    if (!feature) return null;
                    return (
                      <li key={n} className="flex items-start gap-2.5 text-[15px]">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? "text-[#e8682f]" : "text-[#c2410c]"}`} />
                        <span className={highlighted ? "text-[#faf8f3]/85" : ""}>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-10">
                  {highlighted ? (
                    <InkCta href="/products/new" big light>
                      <span className="w-full text-center">{t(`plan_${plan}_cta`)}</span>
                    </InkCta>
                  ) : (
                    <Link
                      href="/products/new"
                      className="block w-full border border-[#16130e]/25 px-7 py-3.5 text-center text-lg font-medium transition-colors duration-300 hover:border-[#16130e] hover:bg-[#16130e] hover:text-[#faf8f3]"
                      style={{ borderRadius: 999 }}
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

      {/* ── 06 FAQ — lève les objections ── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <SectionHeading index="06" eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
        <div className="grid gap-x-16 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="anim-fade-up border-t border-[#16130e]/12 py-8"
              style={{ animationDelay: `${n * 80}ms` }}
            >
              <h3 className="display-tight text-2xl leading-snug">
                {t(`faq${n}Q`)}
              </h3>
              <p className="mt-4 leading-relaxed text-[#6f6a5e]">{t(`faq${n}A`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final — encre pleine ── */}
      <section className="bg-[#16130e] text-[#faf8f3]">
        <div className="mx-auto max-w-7xl px-5 py-28 text-center sm:px-8 sm:py-36">
          <h2
            className="display-tight anim-fade-up mx-auto max-w-4xl leading-[1.02]"
            style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.5rem)" }}
          >
            {t("finalTitleA")}{" "}
            <em className="italic text-[#e8682f]">{t("finalTitleB")}</em>
          </h2>
          <p className="anim-fade-up mx-auto mt-6 max-w-xl text-xl text-[#faf8f3]/60" style={{ animationDelay: "120ms" }}>
            {t("finalSubtitle")}
          </p>
          <div className="anim-fade-up mt-10" style={{ animationDelay: "220ms" }}>
            <InkCta href="/products/new" big light>
              {t("finalCta")}
              <ArrowRight className="h-5 w-5" />
            </InkCta>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#16130e]/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-10 sm:flex-row sm:px-8">
          <Wordmark />
          <nav className="flex flex-wrap items-center justify-center gap-7 text-xs tracking-wide text-[#6f6a5e]">
            <a href="#proof" className="transition-colors hover:text-[#16130e]">{t("navProof")}</a>
            <a href="#how" className="transition-colors hover:text-[#16130e]">{t("navHow")}</a>
            <a href="#pricing" className="transition-colors hover:text-[#16130e]">{t("navPricing")}</a>
            <Link href="/login" className="transition-colors hover:text-[#16130e]">{t("navLogin")}</Link>
          </nav>
          <p className="text-xs text-[#6f6a5e]">{t("footerRights")}</p>
        </div>
      </footer>
    </div>
  );
}
