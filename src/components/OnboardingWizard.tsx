"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Box,
  Upload,
  QrCode,
  PartyPopper,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "arshot_onboarding_done";

const STEPS = [
  {
    id: "welcome",
    icon: Box,
    title: "Bienvenue sur ARShot 🎉",
    subtitle: "Vos produits en 3D et AR en moins de 2 minutes",
    description:
      "ARShot transforme vos photos produit en expériences 3D interactives. Vos clients pourront visualiser vos produits dans leur espace — sans télécharger d'app.",
    highlights: [
      "1 photo → modèle 3D en 2 min",
      "Viewer AR sur iPhone et Android",
      "QR code + embed code automatiques",
      "Analytics de scans en temps réel",
    ],
    cta: "Commencer",
    ctaHref: null as string | null,
  },
  {
    id: "upload",
    icon: Upload,
    title: "Ajoutez votre premier produit",
    subtitle: "Étape 1/3 — Upload",
    description:
      "Prenez une photo nette de votre produit sur fond uni (blanc ou gris). Notre IA supprime l'arrière-plan et génère un modèle 3D photoréaliste.",
    highlights: [
      "Photo JPG / PNG / WEBP",
      "Résolution minimum 512 × 512 px",
      "Fond uni recommandé",
      "Génération en ~2 minutes",
    ],
    cta: "Ajouter un produit →",
    ctaHref: "/products/new",
  },
  {
    id: "share",
    icon: QrCode,
    title: "Partagez en 1 clic",
    subtitle: "Étape 2/3 — Partage",
    description:
      "Une fois votre modèle prêt, vous obtenez automatiquement un QR code à imprimer et un embed code à coller sur votre site Shopify, WooCommerce ou n'importe quelle page.",
    highlights: [
      "QR code téléchargeable PNG/SVG",
      "Lien shareable pour Instagram & TikTok",
      "Embed code 1 ligne pour votre site",
      "Viewer AR hébergé par ARShot",
    ],
    cta: "Voir mes produits",
    ctaHref: "/products",
  },
  {
    id: "done",
    icon: PartyPopper,
    title: "Vous êtes prêt !",
    subtitle: "Étape 3/3 — Terminé",
    description:
      "Votre compte ARShot est configuré. Avec le plan Free, vous pouvez créer jusqu'à 3 produits. Upgradez pour débloquer plus de générations et supprimer le watermark.",
    highlights: [
      "3 produits gratuits sans carte bancaire",
      "Upgrade à tout moment depuis Facturation",
      "Support communauté disponible",
      "Analytics dès le premier scan",
    ],
    cta: "Accéder au dashboard",
    ctaHref: "/dashboard",
  },
] as const;

interface Props {
  onDone: () => void;
}

export function OnboardingWizard({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "1");
      onDone();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onDone();
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-[#0066FF] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#0066FF]/10 flex items-center justify-center mb-5">
            <Icon className="h-7 w-7 text-[#0066FF]" />
          </div>

          {/* Step label */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {current.subtitle}
          </p>
          <h2 className="text-xl font-bold mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground mb-5">{current.description}</p>

          {/* Highlights */}
          <ul className="space-y-2 mb-7">
            {current.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {current.ctaHref ? (
              <Link href={current.ctaHref} className="flex-1" onClick={handleNext}>
                <Button className="w-full gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                  {current.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                className="flex-1 gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white"
                onClick={handleNext}
              >
                {current.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {!isLast && (
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                Passer
              </Button>
            )}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-[#0066FF]" : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label={`Étape ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Retourne true si l'onboarding n'a pas encore été vu */
export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}
