"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK } from "@/lib/api";
import {
  ArrowRight,
  Zap,
  QrCode,
  BarChart3,
  Star,
  CheckCircle2,
  Smartphone,
  Globe,
  ShieldCheck,
} from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "0€",
    period: "/mois",
    desc: "Pour tester",
    features: ["3 produits", "Watermark ARShot", "Viewer AR public", "QR code"],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    name: "Starter",
    price: "29€",
    period: "/mois",
    desc: "Pour les indépendants",
    features: ["25 produits", "Sans watermark", "Analytics basiques", "Support email"],
    cta: "Choisir Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: "79€",
    period: "/mois",
    desc: "Pour les boutiques",
    features: ["100 produits", "Analytics avancées", "Embed codes", "Support prioritaire"],
    cta: "Choisir Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "199€",
    period: "/mois",
    desc: "Pour les marques",
    features: ["500 produits", "White-label", "API accès", "Account manager"],
    cta: "Choisir Business",
    highlight: false,
  },
];

const STATS = [
  { value: "+94%", label: "de conversions en moyenne" },
  { value: "< 2 min", label: "pour générer un modèle 3D" },
  { value: "0", label: "app à télécharger" },
  { value: "100%", label: "mobile-first" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "1 photo → modèle 3D",
    desc: "Notre IA transforme n'importe quelle photo produit en modèle 3D interactif en moins de 2 minutes.",
  },
  {
    icon: Smartphone,
    title: "Réalité Augmentée native",
    desc: "Vos clients voient le produit dans leur salon directement depuis Safari ou Chrome. Zéro app, zéro friction.",
  },
  {
    icon: QrCode,
    title: "QR Code & lien shareable",
    desc: "Partagez vos modèles 3D par QR code sur vos flyers, emballages, Instagram, TikTok ou votre site.",
  },
  {
    icon: Globe,
    title: "Embed partout",
    desc: "Une ligne de code pour intégrer le viewer AR sur Shopify, WooCommerce, PrestaShop ou n'importe quel site.",
  },
  {
    icon: BarChart3,
    title: "Analytics en temps réel",
    desc: "Suivez combien de clients scannent vos QR codes, depuis quel pays, quel device, et combien convertissent.",
  },
  {
    icon: ShieldCheck,
    title: "Made in France, RGPD",
    desc: "Données hébergées en Europe, conformité RGPD, support en français. Prix en euros, facturation française.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!loading && user && !IS_MOCK) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [user, loading, router, locale]);

  if (loading && !IS_MOCK) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user && !IS_MOCK) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">
            AR<span className="text-violet-400">Shot</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/pricing`}>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                Tarifs
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 text-center relative">
        {/* Gradient orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-violet-600/20 via-emerald-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Badge className="mb-6 bg-violet-500/10 text-violet-300 border-violet-500/30 text-xs px-3 py-1">
            Made in France 🇫🇷 · RGPD · Sans app
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Vos produits en{" "}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              3D et Réalité Augmentée
            </span>
            <br />
            en moins de 2 minutes
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            1 photo → modèle 3D interactif + viewer AR + QR code + analytics de conversion.
            Vos clients voient le produit chez eux, sans télécharger d'app.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${locale}/login`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white border-0 px-8 text-base font-semibold"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/${locale}/pricing`}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 px-8 text-base"
              >
                Voir les tarifs
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/30">
            Gratuit jusqu'à 3 produits · Sans carte bancaire · Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Tout ce qu'il faut pour vendre en 3D
          </h2>
          <p className="text-center text-white/50 mb-14 max-w-xl mx-auto">
            Une plateforme complète — de la génération du modèle jusqu'aux analytics de conversion.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-violet-500/30 hover:bg-white/5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">Tarifs simples et transparents</h2>
          <p className="text-center text-white/50 mb-14">
            Commencez gratuitement. Évoluez à votre rythme.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 flex flex-col transition-all ${
                  p.highlight
                    ? "border-violet-500/50 bg-violet-500/8 ring-1 ring-violet-500/30"
                    : "border-white/8 bg-white/3"
                }`}
              >
                {p.highlight && (
                  <Badge className="self-start mb-3 bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                    Populaire
                  </Badge>
                )}
                <p className="text-sm text-white/50 mb-1">{p.name}</p>
                <p className="text-3xl font-extrabold">
                  {p.price}
                  <span className="text-sm font-normal text-white/40">{p.period}</span>
                </p>
                <p className="text-xs text-white/40 mt-1 mb-4">{p.desc}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/login`}>
                  <Button
                    size="sm"
                    variant={p.highlight ? "default" : "outline"}
                    className={`w-full ${
                      p.highlight
                        ? "bg-violet-600 hover:bg-violet-500 border-0 text-white"
                        : "border-white/20 text-white hover:bg-white/5"
                    }`}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-white/30 mt-6">
            Tous les prix HT · TVA française applicable · Abonnement annuel -20%
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <blockquote className="text-lg text-white/80 italic mb-4">
            "En 3 jours, j'ai mis tous mes produits en AR sur mon Shopify. Mes clients adorent et
            mes retours ont diminué de 40%."
          </blockquote>
          <p className="text-sm text-white/40">Sophie D. — Boutique de mobilier design, Paris</p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à vendre en 3D ?</h2>
          <p className="text-white/50 mb-8">
            Rejoignez des centaines de marchands qui utilisent ARShot pour augmenter leurs
            conversions.
          </p>
          <Link href={`/${locale}/login`}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white border-0 px-10 text-base font-semibold"
            >
              Démarrer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-xs text-white/30">
            3 produits gratuits · Sans carte bancaire · Support en français
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-sm">
            AR<span className="text-violet-400">Shot</span>
          </span>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/fr/legal/privacy" className="hover:text-white/60">Confidentialité</Link>
            <Link href="/fr/legal/terms" className="hover:text-white/60">CGU</Link>
            <Link href="/fr/legal/cookies" className="hover:text-white/60">Cookies</Link>
          </div>
          <p className="text-xs text-white/30">© 2026 ARShot SAS · Made in France 🇫🇷</p>
        </div>
      </footer>
    </div>
  );
}
